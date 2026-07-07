import React, { useState } from 'react';
import RatingStars from '../RatingStars/RatingStars';

const ReviewForm = ({ onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(rating, review);
        setRating(0);
        setReview('');
    };

    return (
        <form onSubmit={handleSubmit} style={{
            display: 'flex', flexDirection: 'column', gap: '15px', 
            padding: '20px', border: '1px solid #e0e0e0', 
            borderRadius: '8px', backgroundColor: '#f9f9f9'
        }}>
            <h3 style={{ margin: 0, color: '#333' }}>Write a Review</h3>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rating:</label>
                <RatingStars rating={rating} interactive={true} onRate={setRating} size={24} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Review:</label>
                <textarea 
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell us what you thought about this dish..."
                    style={{
                        width: '100%', minHeight: '100px', padding: '10px', 
                        borderRadius: '4px', border: '1px solid #ccc',
                        fontFamily: 'inherit', resize: 'vertical',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
            <button type="submit" style={{
                padding: '12px 20px', backgroundColor: '#E31837', 
                color: 'white', border: 'none', borderRadius: '4px', 
                cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
                alignSelf: 'flex-start'
            }}>
                Submit Review
            </button>
        </form>
    );
};

export default ReviewForm;
