import React, { useContext, useEffect, useState } from 'react';
import './CartSuggestions.css';
import { StoreContext } from '../../context/Store_context';
import axios from 'axios';
import Fooditem from '../Fooditem/Fooditem';

const CartSuggestions = () => {
    const { url, cartitems } = useContext(StoreContext);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // Get food IDs currently present in cart
                const cartFoodIds = Object.keys(cartitems)
                    .filter(id => cartitems[id] > 0);

                // If cart is empty, remove suggestions
                if (cartFoodIds.length === 0) {
                    setSuggestions([]);
                    return;
                }

                const response = await axios.post(
                    `${url}/api/recommendations/cart-suggestions`,
                    { cartFoodIds }
                );

                if (response.data.success) {
                    setSuggestions(response.data.data);
                }

            } catch (error) {
                console.error(
                    "Error fetching cart suggestions:",
                    error
                );
            }
        };

        fetchSuggestions();

    }, [cartitems, url]);


    // Don't show section if there are no recommendations
    if (suggestions.length === 0) {
        return null;
    }


    return (
        <div className="cart-suggestions">

            {/* Header */}
            <div className="cart-suggestions-header">

                <div>
                    <h3>Complete Your Order</h3>

                    <p>
                        Perfect additions to your current order
                    </p>
                </div>

                <span className="suggestions-badge">
                    ✨ Recommended
                </span>

            </div>


            {/* Suggestions */}
            <div className="suggestions-list">

                {suggestions.map((item, index) => (

                    <div
                        className="suggestion-card"
                        key={item._id || index}
                    >

                        <Fooditem
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                            averageRating={item.averageRating || 0}
                            totalRatings={item.totalRatings || 0}
                        />

                    </div>

                ))}

            </div>

        </div>
    );
};

export default CartSuggestions;