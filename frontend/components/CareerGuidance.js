//CareeGuidance.js
'use client';

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mic, Search, MessageSquare, TrendingUp, Route, X, MessageCircle } from "lucide-react";
import "./CareerGuidance.css";
import GoogleTranslate from "./GoogleTranslate";
import CareerPathVisualizer from './CareerPathVisualizer';
import IndustryInsightsDashboard from './IndustryInsightsDashboard';
import CareerChatbot from './CareerChatbot';

const CareerGuidance = () => {
    // State variables
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [theme, setTheme] = useState("light");
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState("coach");

    // Add useEffect to handle client-side initialization
    useEffect(() => {
        setIsClient(true);
        // Load saved data from localStorage after component mounts
        const savedQuery = localStorage.getItem("aiCoachQuery");
        const savedResponse = localStorage.getItem("aiCoachResponse");
        const savedTheme = localStorage.getItem("theme");
        const savedTab = localStorage.getItem("activeTab");

        if (savedQuery) setQuery(savedQuery);
        if (savedResponse) setResponse(savedResponse);
        if (savedTheme) setTheme(savedTheme);
        if (savedTab) setActiveTab(savedTab);
    }, []);

    // Save query and response to localStorage when they change
    useEffect(() => {
        if (isClient) {
            localStorage.setItem("aiCoachQuery", query);
        }
    }, [query, isClient]);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("aiCoachResponse", response);
        }
    }, [response, isClient]);

    // Save active tab to localStorage
    useEffect(() => {
        if (isClient) {
            localStorage.setItem("activeTab", activeTab);
        }
    }, [activeTab, isClient]);

    // Apply theme when it changes
    useEffect(() => {
        if (isClient) {
            document.body.className = theme;
            localStorage.setItem("theme", theme);
        }
    }, [theme, isClient]);

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

    // Add clear function for AI Coach
    const clearAICoach = () => {
        setQuery("");
        setResponse("");
        localStorage.removeItem("aiCoachQuery");
        localStorage.removeItem("aiCoachResponse");
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

            {/* Improved Tab Navigation - Removed Chatbot Tab */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === "coach" ? "active" : ""}`}
                    onClick={() => setActiveTab("coach")}
                >
                    <MessageSquare size={16} />
                    <span>Career Coach</span>
                </button>
                <button
                    className={`tab-button ${activeTab === "pathVisualizer" ? "active" : ""}`}
                    onClick={() => setActiveTab("pathVisualizer")}
                >
                    <Route size={16} />
                    <span>Career Paths</span>
                </button>
                <button
                    className={`tab-button ${activeTab === "industryInsights" ? "active" : ""}`}
                    onClick={() => setActiveTab("industryInsights")}
                >
                    <TrendingUp size={16} />
                    <span>Industry Insights</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="career-guidance-main">
                {/* Coach Tab Content */}
                {activeTab === "coach" && (
                    <>
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

                        <hr />
                        <br />

                        {/* AI Chat Area */}
                        <div className="career-chat-card">
                            <div className="chat-header">
                                <h2>AI Career Coach</h2>
                                <button
                                    onClick={clearAICoach}
                                    className="clear-button"
                                    title="Clear conversation"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-color)',
                                        cursor: 'pointer',
                                        opacity: 0.8,
                                        padding: '4px 8px',
                                        fontSize: '14px'
                                    }}
                                >
                                    Clear
                                </button>
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
                    </>
                )}

                {/* Career Path Visualizer Tab Content */}
                {activeTab === "pathVisualizer" && (
                    <div className="tab-content">
                        <CareerPathVisualizer />
                    </div>
                )}

                {/* Industry Insights Tab Content */}
                {activeTab === "industryInsights" && (
                    <div className="tab-content">
                        <IndustryInsightsDashboard />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerGuidance;