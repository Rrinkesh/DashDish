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
                // Get list of food IDs in cart
                const cartFoodIds = Object.keys(cartitems).filter(id => cartitems[id] > 0);
                
                if (cartFoodIds.length === 0) {
                    setSuggestions([]);
                    return;
                }

                const response = await axios.post(`${url}/api/recommendations/cart-suggestions`, { cartFoodIds });
                if (response.data.success) {
                    setSuggestions(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching cart suggestions", error);
            }
        };

        fetchSuggestions();
    }, [cartitems, url]);

    if (suggestions.length === 0) return null;

    return (
        <div className="cart-suggestions">
            <h3>Frequently Bought Together</h3>
            <div className="suggestions-list">
                {suggestions.map((item, index) => (
                    <div className="suggestion-card" key={index}>
                        <Fooditem 
                            id={item._id} 
                            name={item.name} 
                            description={item.description} 
                            price={item.price} 
                            image={item.image} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CartSuggestions;
