import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/');
    };

    return (
        <div className="welcome-container" onClick={handleContinue}>
            <div className="welcome-content">
                <h1 className="welcome-text" data-text="Welcome to DashDish">
                    Welcome to DashDish
                </h1>
                <p className="welcome-subtext">Click anywhere to continue to home</p>
            </div>
            
            {/* Background decorative elements */}
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
        </div>
    );
};

export default Welcome;
