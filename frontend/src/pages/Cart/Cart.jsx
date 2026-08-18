import React, { useContext } from 'react';
import './Cart.css';
import CartSuggestions from '../../components/CartSuggestions/CartSuggestions';
import { StoreContext } from '../../context/Store_context';
import { useNavigate } from 'react-router-dom';

const Cart = () => {

    const {
        cartitems,
        food_list,
        removefromcart,
        gettotalamount,
        url
    } = useContext(StoreContext);

    const navigate = useNavigate();

    const subtotal = gettotalamount();
    const deliveryFee = subtotal === 0 ? 0 : 2;
    const total = subtotal === 0 ? 0 : subtotal + deliveryFee;

    return (

        <div className="cart">

            {/* =========================================
                CART HEADER
            ========================================= */}

            <div className="cart-heading">

                <div>
                    <h1>Your Cart</h1>

                    <p>
                        Review your delicious selections before checkout.
                    </p>
                </div>

                <span className="cart-heading-badge">
                    🛒 Ready to order
                </span>

            </div>


            {/* =========================================
                CART ITEMS
            ========================================= */}

            <div className="cartitems">

                {/* Table Header */}

                <div className="cartitems-title cartitems-header">

                    <p>Items</p>
                    <p>Title</p>
                    <p>Price</p>
                    <p>Quantity</p>
                    <p>Total</p>
                    <p>Remove</p>

                </div>

                <hr />


                {/* Cart Products */}

                {food_list.map((item, ind) => {

                    if (cartitems[item._id] > 0) {

                        return (

                            <div
                                key={item._id || ind}
                                className="cart-product-row"
                            >

                                <div className="cartitems-title cartitems-item">

                                    {/* Food Image */}

                                    <div className="cart-image-wrapper">

                                        <img
                                            src={`${url}/images/${item.image}`}
                                            alt={item.name}
                                        />

                                    </div>


                                    {/* Food Name */}

                                    <p className="cart-product-name">
                                        {item.name}
                                    </p>


                                    {/* Price */}

                                    <p className="cart-product-price">
                                        ${item.price}
                                    </p>


                                    {/* Quantity */}

                                    <p className="cart-product-quantity">
                                        {cartitems[item._id]}
                                    </p>


                                    {/* Total */}

                                    <p className="cart-product-total">
                                        ${(item.price * cartitems[item._id]).toFixed(2)}
                                    </p>


                                    {/* Remove */}

                                    <button
                                        className="cart-remove"
                                        onClick={() => removefromcart(item._id)}
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        ×
                                    </button>

                                </div>

                                <hr />

                            </div>

                        );
                    }

                    return null;

                })}

            </div>


            {/* =========================================
                BOTTOM SECTION
            ========================================= */}

            <div className="cartbottom">


                {/* =====================================
                    CART TOTAL
                ===================================== */}

                <div className="carttotal">

                    <div className="carttotal-header">

                        <div>

                            <h2>Cart Total</h2>

                            <p>
                                Your order summary
                            </p>

                        </div>

                        <span className="secure-badge">
                            🔒 Secure
                        </span>

                    </div>


                    <div className="carttotal-details">

                        <p>Subtotal</p>

                        <p>
                            ${subtotal.toFixed(2)}
                        </p>

                    </div>


                    <hr />


                    <div className="carttotal-details">

                        <p>Delivery Fee</p>

                        <p>
                            ${deliveryFee.toFixed(2)}
                        </p>

                    </div>


                    <hr />


                    <div className="carttotal-details cart-total-final">

                        <p>Total</p>

                        <p>
                            ${total.toFixed(2)}
                        </p>

                    </div>


                    <button
                        className="checkout-button"
                        onClick={() => navigate('/order')}
                        disabled={subtotal === 0}
                    >

                        Proceed to Checkout

                        <span>→</span>

                    </button>


                    {subtotal === 0 && (

                        <p className="empty-cart-message">
                            Add some delicious food to continue 🍕
                        </p>

                    )}

                </div>


                {/* =====================================
                    PROMO CODE
                ===================================== */}

                <div className="cart-promocode">

                    <div className="promo-content">

                        <span className="promo-icon">
                            🎟️
                        </span>

                        <div>

                            <h3>
                                Have a promo code?
                            </h3>

                            <p>
                                Enter your code and save on your order.
                            </p>

                        </div>

                    </div>


                    <div className="promocode-input">

                        <input
                            type="text"
                            placeholder="Enter promo code"
                        />

                        <button>
                            Apply
                        </button>

                    </div>


                    <div className="promo-hint">
                        ✨ Special offers may be available
                    </div>

                </div>

            </div>


            {/* =========================================
                CART RECOMMENDATIONS
            ========================================= */}

            <CartSuggestions />

        </div>

    );
};

export default Cart;