from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from googletrans import Translator
import google.generativeai as genai
import os

app = FastAPI()

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set your Gemini API key
os.environ["GOOGLE_API_KEY"] = "AIzaSyCqBgF8MwBFu_z12AzVodwdHlc8CO1XmZc"  # Replace with your Gemini API key
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Load Gemini model
model = genai.GenerativeModel("gemini-2.5-pro-exp-03-25")

# System-level prompt to constrain the model to career-related queries
SYSTEM_PROMPT = ('You are a highly skilled career guidance assistant. You only answer questions related to career advice, professional development, skills acquisition, job opportunities, or education. If a user asks about mathematics, logic puzzles, or any unrelated topics, you should politely explain that your expertise is focused on career guidance and hence the query is invalid and ask them to ask questions based on such. Also, suggest some actual courses and course-links related to the query, if it is valid.')

# Translation function
def translate_text(text, target_language="en"):
    translator = Translator()
    translation = translator.translate(text, dest=target_language)
    return translation.text

# Language Detection function
def detect_language(text):
    translator = Translator()
    lang = translator.detect(text)
    return lang.lang

@app.post("/career-guidance")
async def career_guidance(request: Request):
    body = await request.json()
    user_query = body.get("query", "")

    if not user_query:
        return {"error": "No query provided"}

    try:
        # Step 1: Detect the language of the input
        detected_language = detect_language(user_query)

        # Step 2: Translate the user query to English if it's not in English
        translated_query = user_query if detected_language == "en" else translate_text(user_query, target_language="en")

        # Add the system-level prompt to every query to enforce career-related behavior
        prompt_with_system = SYSTEM_PROMPT + "\n" + translated_query

        # Step 3: Get response from Gemini
        response = model.generate_content(prompt_with_system)

        # Extract the text content from the response
        response_text = response.parts[0].text if hasattr(response, "parts") and response.parts else "No response"

        # Step 4: Return the response in the original language if it was not English
        final_response = response_text if detected_language == "en" else translate_text(response_text, target_language=detected_language)

        return {"response": final_response, "language": detected_language}
    except Exception as e:
        return {"error": str(e)}

@app.post("/translate")
async def translate(request: Request):
    body = await request.json()
    text = body.get("text", "")
    target_language = body.get("language", "en")
    translated_text = translate_text(text, target_language)
    return {"translated_text": translated_text}
