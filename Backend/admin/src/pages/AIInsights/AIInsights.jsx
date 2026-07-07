import React, { useEffect, useState, useRef } from 'react';
import './AIInsights.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AIInsights = ({ url }) => {
    const [summary, setSummary] = useState(null);
    const [forecast, setForecast] = useState("");
    const [loadingForecast, setLoadingForecast] = useState(true);
    
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([{ sender: 'ai', text: "Hello! I am your AI Restaurant Consultant. Ask me anything about your sales, inventory, or demand trends." }]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // 1. Fetch Summary
                const sumRes = await axios.get(`${url}/api/analytics/summary`);
                if (sumRes.data.success) {
                    setSummary(sumRes.data.data);
                }

                // 2. Fetch AI Forecast
                const forecastRes = await axios.get(`${url}/api/analytics/forecast`);
                if (forecastRes.data.success) {
                    setForecast(forecastRes.data.data);
                } else {
                    setForecast("Error loading forecast.");
                }
            } catch (error) {
                toast.error("Failed to load AI Insights");
            } finally {
                setLoadingForecast(false);
            }
        };

        fetchDashboard();
    }, [url]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isChatLoading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const newMessages = [...messages, { sender: 'user', text: chatInput }];
        setMessages(newMessages);
        setChatInput("");
        setIsChatLoading(true);

        try {
            const response = await axios.post(`${url}/api/analytics/chat`, {
                message: chatInput,
                history: newMessages
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { sender: 'ai', text: response.data.text }]);
            } else {
                toast.error(response.data.message);
                setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't process that right now." }]);
            }
        } catch (error) {
            toast.error("Connection error with AI");
            setMessages(prev => [...prev, { sender: 'ai', text: "Connection error." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="ai-insights">
            <h2>Business AI Intelligence</h2>
            
            {/* KPI CARDS */}
            {summary && (
                <div className="insights-kpi-grid">
                    <div className="kpi-card revenue">
                        <h3>7-Day Revenue</h3>
                        <p>₹{summary.totalRevenue}</p>
                        <span>{summary.totalOrders} total orders</span>
                    </div>
                    <div className="kpi-card best-seller">
                        <h3>Top Seller</h3>
                        <p>{summary.bestSellers[0] || "N/A"}</p>
                    </div>
                    <div className="kpi-card alerts">
                        <h3>Inventory Alerts</h3>
                        <p>{summary.outOfStock.length} Out of stock</p>
                        <p>{summary.lowStock.length} Low stock</p>
                    </div>
                </div>
            )}

            <div className="insights-main-grid">
                {/* FORECAST PANEL */}
                <div className="forecast-panel">
                    <h3>AI Demand Forecast</h3>
                    {loadingForecast ? (
                        <div className="loading-spinner">Analyzing past 7 days of data...</div>
                    ) : (
                        <div className="forecast-content">
                            <div dangerouslySetInnerHTML={{__html: forecast.replace(/\n/g, '<br/>')}} />
                        </div>
                    )}
                </div>

                {/* AI CHAT INTERFACE */}
                <div className="ai-consultant-panel">
                    <h3>Chat with AI Consultant</h3>
                    <div className="chat-window">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.sender}`}>
                                <div dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>')}} />
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="chat-message ai loading">Thinking...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chat-input-form" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="e.g. Why did sales drop yesterday?"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <button type="submit" disabled={isChatLoading || !chatInput.trim()}>Ask</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
