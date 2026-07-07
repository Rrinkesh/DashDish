import React, { useContext, useEffect, useState } from 'react';
import './RecommendedForYou.css';
import { StoreContext } from '../../context/Store_context';
import axios from 'axios';
import Fooditem from '../Fooditem/Fooditem';

const RecommendedForYou = () => {
    const { url, token } = useContext(StoreContext);
    const [recommendations, setRecommendations] = useState([]);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const headers = token ? { token } : {};
                const response = await axios.get(`${url}/api/recommendations`, { headers });
                
                if (response.data.success) {
                    setRecommendations(response.data.data);
                    setReason(response.data.reason);
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [url, token]);

    if (loading || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="recommended-section" id="recommended">
            <div className="recommended-header">
                <h2>Recommended For You</h2>
                <p className="recommended-reason">{reason}</p>
            </div>
            
            <div className="recommended-scroller">
                <div className="recommended-list">
                    {recommendations.map((item, index) => (
                        <div className="recommended-card-wrapper" key={index}>
                            <Fooditem 
                                id={item._id} 
                                name={item.name} 
                                description={item.description} 
                                price={item.price} 
                                image={item.image} 
                                category={item.category} 
                                averageRating={item.averageRating} 
                                totalRatings={item.totalRatings} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecommendedForYou;
