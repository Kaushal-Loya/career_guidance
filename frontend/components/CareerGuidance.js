'use client';

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mic, Search, MessageSquare } from "lucide-react";
import "./CareerGuidance.css";
import GoogleTranslate from "./GoogleTranslate";

const CareerGuidance = () => {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [theme, setTheme] = useState("light");

    // Initialize theme from localStorage after mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    // Apply theme when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.className = theme;
            localStorage.setItem("theme", theme);
        }
    }, [theme]);

    const handleQueryWithText = async (inputText) => {
        if (!inputText.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/career-guidance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: inputText }),
            });

            const data = await res.json();
            if (data.error) {
                setResponse(data.error);
            } else {
                setResponse(data.response || "No response.");
            }
        } catch (err) {
            setResponse("Error connecting to backend.");
        }
        setLoading(false);
    };

    const handleQuery = () => {
        handleQueryWithText(query);
    };

    const handleVoiceInput = () => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "en-US";

            recognition.start();
            setIsListening(true);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                handleQueryWithText(transcript);
                setIsListening(false);
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
        } else {
            alert("Speech Recognition is not supported in this browser.");
        }
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleQuery();
        }
    };

    return (
        <div className="career-guidance-container">
            {/* Header */}
            <div className="career-guidance-header">
                <div className="header-controls">
                    <div className="theme-toggle" onClick={toggleTheme}>
                        <span>{theme === "light" ? "🌙" : "☀️"}</span>
                    </div>
                    <GoogleTranslate />
                </div>
                <h1>JobGenie - Career Guidance</h1>
                <p className="subtitle">Get personalized career advice, skill development recommendations, and industry insights.</p>
            </div>

            {/* Main Content */}
            <div className="career-guidance-main">
                {/* Features Card */}
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <MessageSquare size={24} />
                        </div>
                        <h3>Personal Career Advice</h3>
                        <p>Get tailored guidance for your specific career questions and challenges</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Search size={24} />
                        </div>
                        <h3>Skill Development</h3>
                        <p>Learn which skills to develop based on your career goals and industry trends</p>
                    </div>
                </div>

                <hr></hr>
                <br></br>

                {/* AI Chat Area */}
                <div className="career-chat-card">
                    <div className="chat-header">
                        <h2>AI Career Coach</h2>
                    </div>

                    <div className="chat-input-area">
                        <textarea
                            className="input-box"
                            placeholder="Ask a career-related question..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={3}
                        />

                        <div className="input-controls">
                            <button className="ask-button" onClick={handleQuery} disabled={loading}>
                                {loading ? "Processing..." : "Get assistance"}
                            </button>

                            <button
                                className={`mic-button ${isListening ? "listening" : ""}`}
                                onClick={handleVoiceInput}
                                title="Speak your query"
                            >
                                <Mic size={18} />
                            </button>
                        </div>
                    </div>

                    {response && (
                        <div className="response-container">
                            <div className="response-header">
                                <h3 className="response-title">Response:</h3>
                            </div>
                            <div className="response-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {response}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Trust Indicator */}
                <div className="trust-indicator">
                    <div className="user-icon">👥</div>
                    <p>Trusted by 500K+ job seekers worldwide</p>
                </div>
            </div>
        </div>
    );
};

export default CareerGuidance;