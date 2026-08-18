import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/Store_context'
import Fooditem from '../Fooditem/Fooditem'

const FoodDisplay = ({ category, topRated = false, searchTerm = "", minRating = 0 }) => {
  const { food_list } = useContext(StoreContext)

  // Filter by category if not 'all'
  let displayList = food_list;
  if (category && category !== "all") {
      displayList = displayList.filter(item => item.category === category);
  }

  // Filter by search term
  if (searchTerm) {
      displayList = displayList.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }

  // Filter by min rating
  if (minRating > 0) {
      displayList = displayList.filter(item => (item.averageRating || 0) >= minRating);
  }

  // If topRated is true, sort by rating and take top 5
  if (topRated) {
      displayList = [...displayList]
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 5);
  }

  return (
    <div className='food-display' id='food-display'>
      <h2>
    {topRated ? '⭐ Top Rated Dishes' : '🔥 Popular Near You'}
</h2>
      
      {displayList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <h3>Item Not Available</h3>
            <p style={{ marginTop: '10px' }}>Try adjusting your search or filters!</p>
        </div>
      ) : (
        <div className="food-display-list">
          {displayList.map((item, index) => {
            return (
              <Fooditem 
                key={index} 
                id={item._id} 
                name={item.name} 
                description={item.description} 
                price={item.price} 
                image={item.image}
                averageRating={item.averageRating}
                totalRatings={item.totalRatings}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
export default FoodDisplay