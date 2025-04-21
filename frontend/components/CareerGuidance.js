'use client';

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mic, Globe, Search, MessageSquare } from "lucide-react";
import "./CareerGuidance.css";

const CareerGuidance = () => {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [translatedResponse, setTranslatedResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [theme, setTheme] = useState(typeof localStorage !== 'undefined' ? localStorage.getItem("theme") || "light" : "light");

    // Language options with labels and codes
    const languages = [
        { code: "en", name: "English" },
        { code: "es", name: "Spanish (Español)" },
        { code: "hi", name: "Hindi (हिन्दी)" },
        { code: "fr", name: "French (Français)" },
        { code: "de", name: "German (Deutsch)" },
        { code: "zh-cn", name: "Chinese (简体中文)" },
        { code: "ar", name: "Arabic (العربية)" },
        { code: "ta", name: "Tamil (தமிழ்)" },
        { code: "bn", name: "Bengali (বাংলা)" },
        { code: "ru", name: "Russian (Русский)" },
        { code: "ja", name: "Japanese (日本語)" },
        { code: "ko", name: "Korean (한국어)" }
    ];

    // Apply theme on load and when changed
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.className = theme;
            localStorage.setItem("theme", theme);
        }
    }, [theme]);

    // Close language dropdown when clicking outside
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleClickOutside = (event) => {
                if (showLanguageDropdown && !event.target.closest('.translate-icon-container')) {
                    setShowLanguageDropdown(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showLanguageDropdown]);

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
            setTranslatedResponse("");

            // If a non-English language is selected, translate the response
            if (selectedLanguage !== "en") {
                translateText(data.response || "No response.", selectedLanguage);
            }
        } catch (err) {
            setResponse("Error connecting to backend.");
        }
        setLoading(false);
    };

    const handleQuery = () => {
        handleQueryWithText(query);
    };

    const translateText = async (text, language) => {
        if (language === "en") {
            setTranslatedResponse("");
            return;
        }
        setTranslating(true);
        try {
            const res = await fetch("http://localhost:8000/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text, language }),
            });

            const data = await res.json();
            setTranslatedResponse(data.translated_text);
        } catch (err) {
            setTranslatedResponse("Translation failed.");
        }
        setTranslating(false);
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        translateText(response, language);
        setShowLanguageDropdown(false);
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

    // Get language name from code
    const getLanguageName = (code) => {
        const language = languages.find(lang => lang.code === code);
        return language ? language.name : "English";
    };

    return (
        <div className="career-guidance-container">
            {/* Header */}
            <div className="career-guidance-header">
                <div className="theme-toggle" onClick={toggleTheme}>
                    <span>{theme === "light" ? "🌙" : "☀️"}</span>
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
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Globe size={24} />
                        </div>
                        <h3>Industry Insights</h3>
                        <p>Stay up-to-date with the latest trends and opportunities in your field</p>
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

                                <div className="translate-icon-container">
                                    <div
                                        className="translate-icon"
                                        onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                        title={`Translate (Current: ${getLanguageName(selectedLanguage)})`}
                                    >
                                        <Globe size={18} />
                                    </div>
                                    {showLanguageDropdown && (
                                        <div className="language-dropdown">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => handleLanguageChange(lang.code)}
                                                    className={selectedLanguage === lang.code ? "active" : ""}
                                                >
                                                    {lang.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {translating ? (
                                <div className="loading-animation">Translating...</div>
                            ) : (
                                <div className="response-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {translatedResponse || response}
                                    </ReactMarkdown>
                                </div>
                            )}
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