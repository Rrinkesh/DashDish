import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import './CategoryPage.css'

const CategoryPage = () => {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [minRating, setMinRating] = useState(0);

    return (
        <div>
            <div className="category-page-container">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <h1 className="category-title">Explore {categoryName}</h1>
                
                <div className="filter-bar">
                    <input 
                        type="text" 
                        placeholder="Search food by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select 
                        value={minRating} 
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="rating-filter"
                    >
                        <option value={0}>All Ratings</option>
                        <option value={4.5}>4.5+ Stars</option>
                        <option value={4}>4.0+ Stars</option>
                        <option value={3}>3.0+ Stars</option>
                    </select>
                </div>

                <FoodDisplay 
                    category={categoryName} 
                    topRated={false} 
                    searchTerm={searchTerm} 
                    minRating={minRating} 
                />
            </div>
        </div>
    )
}

export default CategoryPage
