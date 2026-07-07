import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingStars = ({ rating, interactive = false, onRate = null, size = 20 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (starValue) => {
    if (interactive && onRate) {
      onRate(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFull = currentRating >= starValue;
        const isHalf = currentRating >= starValue - 0.5 && currentRating < starValue;
        const isEmpty = currentRating < starValue - 0.5;

        return (
          <span
            key={starValue}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            style={{ 
              cursor: interactive ? 'pointer' : 'default',
              color: '#FFD700',
              fontSize: `${size}px`,
              transition: 'transform 0.2s',
              transform: hoverRating === starValue ? 'scale(1.2)' : 'scale(1)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isFull && <FaStar />}
            {isHalf && <FaStarHalfAlt />}
            {isEmpty && <FaRegStar />}
          </span>
        );
      })}
    </div>
  );
};

export default RatingStars;
