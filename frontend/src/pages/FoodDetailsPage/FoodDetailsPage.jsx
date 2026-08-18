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

    const {
        url,
        token,
        cartitems,
        addtocart,
        removefromcart
    } = useContext(StoreContext);

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
            console.error("Food details error:", error);
            toast.error("Unable to load food details");
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${url}/api/reviews/${id}`);

            if (res.data.success) {
                setReviews(res.data.data);
            }
        } catch (error) {
            console.error("Reviews error:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            await Promise.all([
                fetchFoodDetails(),
                fetchReviews()
            ]);

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
                {
                    foodId: id,
                    rating,
                    review: reviewText
                },
                {
                    headers: {
                        token
                    }
                }
            );

            if (res.data.success) {
                toast.success("Review submitted!");

                await Promise.all([
                    fetchFoodDetails(),
                    fetchReviews()
                ]);
            } else {
                toast.error(res.data.message);
            }

        } catch (error) {
            console.error(error);
            toast.error("Error submitting review");
        }
    };

    if (loading) {
        return (
            <div className="food-loading">
                <div className="loading-spinner"></div>
                <p>Loading deliciousness...</p>
            </div>
        );
    }

    if (!food) {
        return (
            <div className="food-not-found">
                <div className="not-found-icon">🍽️</div>

                <h2>Food item not found</h2>

                <p>
                    Sorry, we couldn't find the food you're looking for.
                </p>

                <button onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="food-details-page">

            {/* ================= HERO ================= */}

            <div className="food-details-container">

                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    <span>←</span>
                    Back to menu
                </button>


                {/* ================= PRODUCT ================= */}

                <div className="food-details-card">

                    {/* IMAGE */}

                    <div className="food-details-image-wrapper">

                        <div className="food-image-badge">
                            🔥 Popular Choice
                        </div>

                        <img
                            src={`${url}/images/${food.image}`}
                            alt={food.name}
                            className="food-details-image"
                        />

                        <div className="image-overlay"></div>

                    </div>


                    {/* INFO */}

                    <div className="food-details-info">

                        <span className="food-category-badge">
                            {food.category}
                        </span>

                        <h1>{food.name}</h1>


                        {/* Rating */}

                        <div className="food-details-rating">

                            <div className="rating-pill">

                                <span className="rating-star">
                                    ★
                                </span>

                                <strong>
                                    {food.averageRating
                                        ? Number(food.averageRating).toFixed(1)
                                        : "0.0"}
                                </strong>

                            </div>

                            <RatingStars
                                rating={food.averageRating || 0}
                                size={21}
                            />

                            <span className="review-count">
                                {food.totalRatings || 0} reviews
                            </span>

                        </div>


                        <div className="details-divider"></div>


                        {/* Description */}

                        <p className="food-details-desc">
                            {food.description}
                        </p>


                        {/* Price */}

                        <div className="price-section">

                            <span className="price-label">
                                Price
                            </span>

                            <span className="food-details-price">
                                ${Number(food.price).toFixed(2)}
                            </span>

                        </div>


                        {/* Cart */}

                        <div className="food-details-actions">

                            {!cartitems[id] ? (

                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => addtocart(id)}
                                >
                                    <span>🛒</span>
                                    Add to Cart
                                </button>

                            ) : (

                                <div className="cart-action-wrapper">

                                    <span className="quantity-label">
                                        Quantity
                                    </span>

                                    <div className="cart-controls">

                                        <button
                                            onClick={() =>
                                                removefromcart(id)
                                            }
                                        >
                                            −
                                        </button>

                                        <span>
                                            {cartitems[id]}
                                        </span>

                                        <button
                                            onClick={() =>
                                                addtocart(id)
                                            }
                                        >
                                            +
                                        </button>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* Benefits */}

                        <div className="food-benefits">

                            <div>
                                <span>🚚</span>
                                <p>
                                    <strong>Fast Delivery</strong>
                                    <small>Delivered fresh</small>
                                </p>
                            </div>

                            <div>
                                <span>✨</span>
                                <p>
                                    <strong>Fresh & Tasty</strong>
                                    <small>Made with care</small>
                                </p>
                            </div>

                            <div>
                                <span>🔒</span>
                                <p>
                                    <strong>Secure Order</strong>
                                    <small>Safe checkout</small>
                                </p>
                            </div>

                        </div>

                    </div>

                </div>


                {/* ================= REVIEWS ================= */}

                <section className="food-reviews-section">

                    <div className="reviews-heading">

                        <div>
                            <span className="section-eyebrow">
                                CUSTOMER FEEDBACK
                            </span>

                            <h2>
                                What people are saying
                            </h2>

                            <p>
                                See what other food lovers think about this dish.
                            </p>
                        </div>

                        <div className="review-summary">

                            <strong>
                                {food.averageRating
                                    ? Number(food.averageRating).toFixed(1)
                                    : "0.0"}
                            </strong>

                            <RatingStars
                                rating={food.averageRating || 0}
                                size={18}
                            />

                            <span>
                                {food.totalRatings || 0} ratings
                            </span>

                        </div>

                    </div>


                    {/* Review Form */}

                    <div className="review-form-wrapper">

                        <div className="review-form-header">
                            <span>✍️</span>

                            <div>
                                <h3>Share your experience</h3>
                                <p>
                                    Loved it? Tell others about it!
                                </p>
                            </div>
                        </div>

                        <ReviewForm
                            onSubmit={handleReviewSubmit}
                        />

                    </div>


                    {/* Reviews */}

                    <div className="reviews-list">

                        {reviews.length > 0 ? (

                            reviews.map((review, idx) => (
                                <ReviewCard
                                    key={review._id || idx}
                                    review={review}
                                />
                            ))

                        ) : (

                            <div className="no-reviews">

                                <div className="no-reviews-icon">
                                    💬
                                </div>

                                <h3>No reviews yet</h3>

                                <p>
                                    Be the first person to review this delicious dish!
                                </p>

                            </div>

                        )}

                    </div>

                </section>

            </div>

        </div>
    );
};

export default FoodDetailsPage;