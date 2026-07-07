import React from 'react';
import RatingStars from '../RatingStars/RatingStars';

const ReviewCard = ({ review }) => {
    return (
        <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong style={{ color: '#0055A5' }}>{review.userId?.name || 'Anonymous User'}</strong>
                <span style={{ fontSize: '12px', color: '#888' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                </span>
            </div>
            <RatingStars rating={review.rating} size={16} />
            {review.review && (
                <p style={{ marginTop: '10px', color: '#333', fontSize: '14px', lineHeight: '1.5' }}>
                    {review.review}
                </p>
            )}
        </div>
    );
};

export default ReviewCard;
