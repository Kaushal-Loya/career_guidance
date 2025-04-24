from fastapi import FastAPI, Request 
from fastapi.middleware.cors import CORSMiddleware 
from googletrans import Translator 
import google.generativeai as genai 
import os
import json

app = FastAPI()  

# Allow CORS for local frontend dev 
app.add_middleware(     
    CORSMiddleware,     
    allow_origins=["http://localhost:3000"],     
    allow_credentials=True,     
    allow_methods=["*"],     
    allow_headers=["*"], 
)  

# Set your Gemini API key 
os.environ["GOOGLE_API_KEY"] = "AIzaSyCqBgF8MwBFu_z12AzVodwdHlc8CO1XmZc"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])  

# Load Gemini model 
model = genai.GenerativeModel("gemini-2.5-flash-preview-04-17")  

# System prompts
SYSTEM_PROMPT = '''You are a highly skilled career guidance assistant. You only answer questions related to career advice, professional development, skills acquisition, job opportunities, or education. If a user asks about mathematics, logic puzzles, or any unrelated topics, you should politely explain that your expertise is focused on career guidance and hence the query is invalid and ask them to ask questions based on such. Also, suggest some actual courses and course-links related to the query, if it is valid.'''

CAREER_PATH_PROMPT = """You are a career path expert. Generate a detailed career progression path for the specified career. The response MUST be valid JSON and follow this exact format:
{
    "skills": ["skill1", "skill2", "skill3"],
    "nodes": [
        {
            "id": "entry",
            "title": "Entry Level Position",
            "timeframe": "0-2 years",
            "requirements": ["requirement1", "requirement2", "requirement3"],
            "details": "Detailed description of responsibilities and expectations"
        },
        {
            "id": "mid",
            "title": "Mid-Level Position",
            "timeframe": "2-5 years",
            "requirements": ["requirement1", "requirement2", "requirement3"],
            "details": "Detailed description of responsibilities and expectations"
        },
        {
            "id": "senior",
            "title": "Senior Level Position",
            "timeframe": "5+ years",
            "requirements": ["requirement1", "requirement2", "requirement3"],
            "details": "Detailed description of responsibilities and expectations"
        }
    ]
}"""

# Translation function 
def translate_text(text, target_language="en"):     
    translator = Translator()     
    translation = translator.translate(text, dest=target_language)     
    return translation.text  

# Language Detection function 
def detect_language(text):     
    translator = Translator()     
    detection = translator.detect(text)     
    return detection.lang

@app.post("/career-path")
async def generate_career_path(request: Request):
    try:
        body = await request.json()
        career = body.get("career", "")
        
        if not career:
            return {"error": "No career specified"}
        
        # Detect language and translate if needed
        detected_language = detect_language(career)
        translated_career = career if detected_language == "en" else translate_text(career, target_language="en")
        
        # Create prompt for career path
        prompt = f"{CAREER_PATH_PROMPT}\nGenerate a career path for: {translated_career}"
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        
        # Get the response text
        response_text = response.text if hasattr(response, "text") else response.parts[0].text if hasattr(response, "parts") and response.parts else None
        
        if not response_text:
            return {"error": "No response from AI model"}
            
        # Clean up the response text to ensure it's valid JSON
        # Remove any markdown formatting or extra text
        try:
            # Find the first { and last } to extract just the JSON part
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = response_text[start:end]
                career_path = json.loads(json_str)
            else:
                raise json.JSONDecodeError("No JSON found in response", response_text, 0)
                
            # Translate back if needed
            if detected_language != "en":
                career_path = {
                    "skills": [translate_text(skill, detected_language) for skill in career_path["skills"]],
                    "nodes": [{
                        **node,
                        "title": translate_text(node["title"], detected_language),
                        "requirements": [translate_text(req, detected_language) for req in node["requirements"]],
                        "details": translate_text(node["details"], detected_language)
                    } for node in career_path["nodes"]]
                }
            return career_path
        except json.JSONDecodeError as e:
            print(f"JSON Error: {str(e)}, Response: {response_text}")
            return {
                "error": "Failed to parse career path data",
                "raw_response": response_text
            }
            
    except Exception as e:
        print(f"Error in career path endpoint: {str(e)}")
        return {"error": str(e)}

@app.post("/career-guidance") 
async def career_guidance(request: Request):     
    body = await request.json()     
    user_query = body.get("query", "")      
    
    if not user_query:         
        return {"error": "No query provided"}      
    
    try:         
        detected_language = detect_language(user_query)          
        translated_query = user_query if detected_language == "en" else translate_text(user_query, target_language="en")          
        prompt_with_system = SYSTEM_PROMPT + "\n" + translated_query          
        response = model.generate_content(prompt_with_system)          
        response_text = response.text if hasattr(response, "text") else response.parts[0].text if hasattr(response, "parts") and response.parts else "No response"          
        final_response = response_text if detected_language == "en" else translate_text(response_text, target_language=detected_language)          
        return {"response": final_response, "language": detected_language}     
    except Exception as e:         
        return {"error": str(e)}

@app.post("/career-chatbot")
async def career_chatbot(request: Request):
    try:
        body = await request.json()
        message = body.get("message", "")
        history = body.get("history", [])
        
        if not message:
            return {"error": "No message provided"}
        
        detected_language = detect_language(message)
        translated_message = message if detected_language == "en" else translate_text(message, target_language="en")
        
        content = f"{SYSTEM_PROMPT}\n\nChat history for context (DO NOT repeat this):\n"
        for msg in history:
            role = msg.get("role", "")
            msg_content = msg.get("content", "")
            content += f"\n{role.upper()}: {msg_content}"
        
        content += f"\n\nUSER: {translated_message}\n\nPlease respond to the user's last message."
        
        response = model.generate_content(content)
        response_text = response.text if hasattr(response, "text") else response.parts[0].text if hasattr(response, "parts") and response.parts else "No response"
        final_response = response_text if detected_language == "en" else translate_text(response_text, target_language=detected_language)
        
        return {"response": final_response, "language": detected_language}
    except Exception as e:
        print(f"Error in career-chatbot endpoint: {str(e)}")
        return {"response": f"I'm having trouble processing your request. Error: {str(e)}", "error": str(e)}