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
        <div className="category-page">

            {/* Hero Section */}
            <section className="category-hero">

                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    <span>←</span>
                    Back
                </button>

                <div className="hero-content">
                    <span className="hero-small-text">
                        Fresh • Delicious • Delivered
                    </span>

                    <h1>
                        Explore <span>{categoryName}</span>
                    </h1>

                    <p>
                        Discover delicious food specially selected for you
                    </p>
                </div>

            </section>


            {/* Filters */}
            <div className="filter-wrapper">

                <div className="filter-header">
                    <div>
                        <h3>Find Your Favorite</h3>
                        <p>Search and filter delicious food</p>
                    </div>

                    <div className="filter-icon">
                        ⚙
                    </div>
                </div>

                <div className="filter-bar">

                    {/* Search */}
                    <div className="search-box">

                        <span className="search-icon">
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search food by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {searchTerm && (
                            <button
                                className="clear-search"
                                onClick={() => setSearchTerm("")}
                            >
                                ×
                            </button>
                        )}

                    </div>


                    {/* Rating */}
                    <div className="rating-box">

                        <span className="rating-icon">
                            ⭐
                        </span>

                        <select
                            value={minRating}
                            onChange={(e) =>
                                setMinRating(Number(e.target.value))
                            }
                        >
                            <option value={0}>All Ratings</option>
                            <option value={4.5}>4.5+ Stars</option>
                            <option value={4}>4.0+ Stars</option>
                            <option value={3}>3.0+ Stars</option>
                        </select>

                    </div>

                </div>

            </div>


            {/* Food */}
            <div className="food-results">

                <div className="results-heading">
                    <h2>
                        Popular {categoryName}
                    </h2>

                    <span>
                        🍽️ Delicious choices for you
                    </span>
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