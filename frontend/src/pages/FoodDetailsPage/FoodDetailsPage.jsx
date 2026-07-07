import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/Store_context';
import RatingStars from '../../components/RatingStars/RatingStars';
import ReviewForm from '../../components/ReviewForm/ReviewForm';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import './FoodDetailsPage.css';

const FoodDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { url, token, cartitems, addtocart, removefromcart } = useContext(StoreContext);
    
    const [food, setFood] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFoodDetails = async () => {
        try {
            const res = await axios.get(`${url}/api/food/${id}`);
            if (res.data.success) {
                setFood(res.data.data);
            } else {
                toast.error("Failed to load food details");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${url}/api/reviews/${id}`);
            if (res.data.success) {
                setReviews(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchFoodDetails();
            await fetchReviews();
            setLoading(false);
        };
        loadData();
    }, [id]);

    const handleReviewSubmit = async (rating, reviewText) => {
        if (!token) {
            toast.error("Please log in to submit a review");
            return;
        }
        if (rating < 1) {
            toast.error("Please select a star rating");
            return;
        }
        if (reviewText && reviewText.length > 500) {
            toast.error("Review must be less than 500 characters");
            return;
        }

        try {
            const res = await axios.post(
                `${url}/api/reviews/add`, 
                { foodId: id, rating, review: reviewText },
                { headers: { token } }
            );
            
            if (res.data.success) {
                toast.success("Review submitted!");
                await fetchFoodDetails();
                await fetchReviews();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Error submitting review");
        }
    };

    if (loading) {
        return <div style={{textAlign: 'center', padding: '50px'}}>Loading...</div>;
    }

    if (!food) {
        return <div style={{textAlign: 'center', padding: '50px'}}>Food item not found!</div>;
    }

    return (
        <div>
            <div className="food-details-container">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                
                <div className="food-details-grid">
                    <div className="food-details-image">
                        <img src={`${url}/images/${food.image}`} alt={food.name} />
                    </div>
                    <div className="food-details-info">
                        <h1>{food.name}</h1>
                        <span className="food-category-badge">{food.category}</span>
                        
                        <div className="food-details-rating">
                            <RatingStars rating={food.averageRating} size={24} />
                            <span className="rating-text">
                                {food.averageRating ? food.averageRating : '0'} 
                                <span className="review-count">({food.totalRatings} Reviews)</span>
                            </span>
                        </div>
                        
                        <p className="food-details-desc">{food.description}</p>
                        <p className="food-details-price">${food.price}</p>
                        
                        <div className="food-details-actions">
                            {!cartitems[id] ? (
                                <button className="add-to-cart-btn" onClick={() => addtocart(id)}>
                                    Add to Cart
                                </button>
                            ) : (
                                <div className="cart-controls">
                                    <button onClick={() => removefromcart(id)}>-</button>
                                    <span>{cartitems[id]}</span>
                                    <button onClick={() => addtocart(id)}>+</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="food-reviews-section">
                    <h2>Reviews</h2>
                    <div className="review-form-wrapper">
                        <ReviewForm onSubmit={handleReviewSubmit} />
                    </div>
                    
                    <div className="reviews-list">
                        {reviews.length > 0 ? (
                            reviews.map((review, idx) => (
                                <ReviewCard key={idx} review={review} />
                            ))
                        ) : (
                            <p className="no-reviews">No reviews yet. Be the first to review!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDetailsPage;
