import React, { useState, useEffect, useRef } from 'react';
import './AIChatWidget.css';
import axios from 'axios';
import { assets } from '../../assets/assets';

const AIChatWidget = () => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ sender: 'ai', text: "Hi! I'm DashDish AI. How can I help you choose your food today?" }]);
        }
    }, [isOpen]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { sender: 'user', text: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${url}/api/ai/chat`, {
                message: userMsg.text,
                history: messages
            });

            if (response.data.success) {
                // Typing effect implementation
                const fullText = response.data.text;
                setMessages(prev => [...prev, { sender: 'ai', text: '', isTyping: true, fullText }]);
            } else {
                setMessages(prev => [...prev, { sender: 'ai', text: "Oops, something went wrong. Please try again." }]);
            }
        } catch (error) {
            let errorMsg = "Sorry, I am having trouble connecting right now.";
            if (error.response && error.response.status === 429) {
                errorMsg = "You're sending messages too fast! Please slow down.";
            }
            setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Typing effect logic
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.isTyping) {
            let currentIndex = 0;
            const typingInterval = setInterval(() => {
                if (currentIndex < lastMessage.fullText.length) {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        lastMsg.text = lastMsg.fullText.slice(0, currentIndex + 1);
                        return newMsgs;
                    });
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].isTyping = false;
                        return newMsgs;
                    });
                }
            }, 15); // ms per character
            return () => clearInterval(typingInterval);
        }
    }, [messages]);


    return (
        <div className={`ai-chat-widget ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="ai-chat-btn" onClick={() => setIsOpen(true)}>
                    <img src={assets.selector_icon} alt="AI" />
                    <span>AI Assistant</span>
                </button>
            )}

            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="ai-chat-title">
                            <h3>DashDish AI</h3>
                            <p>Live Menu Assistant</p>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="ai-chat-body">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-bubble ${msg.sender}`}>
                                <div className="chat-text" dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>')}} />
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-bubble ai loading">
                                <div className="typing-dots"><span>.</span><span>.</span><span>.</span></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="ai-chat-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Ask for food recommendations..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChatWidget;
