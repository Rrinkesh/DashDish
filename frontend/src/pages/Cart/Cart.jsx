import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/Store_context'
import { useNavigate } from 'react-router-dom'
import CartSuggestions from '../../components/CartSuggestions/CartSuggestions'

const Cart = () => {
  const { cartitems, food_list, removefromcart,gettotalamount,url } = useContext(StoreContext)
  const navigate =useNavigate();
  return (
    <div className='cart'>
      <div className="cartitems">
        <div className="cartitems-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, ind) => {
          if (cartitems[item._id] > 0) {
            return (
              <div>
                <div className='cartitems-title cartitems-item'>
                  <img src={url+"/images/"+item.image} width={100} alt="" />
                  <p>{item.name}</p>
                  <p>{item.price}</p>
                  <p>{cartitems[item._id]}</p>
                  <p>{item.price * cartitems[item._id]}</p>
                  <p onClick={() => { removefromcart(item._id) }} className='cross'>X</p>

                </div>
                <hr />
              </div>


            )
          }

        })}
      </div>
      <div className="cartbottom">
        <div className="carttotal">
          <h2>Cart Total</h2>
          <div className="carttotal-details">
            <p>Subtotal</p>
            <p>${gettotalamount()}</p>
          </div>
          <hr />
          <div className="carttotal-details">
            <p>Delivery Fee</p>
            <p>{gettotalamount()===0?0:2}</p>
          </div>
          <hr />
          <div className="carttotal-details">
            <p>Total </p>
            <p>${gettotalamount()===0?0:gettotalamount()+2}</p>
          </div>
          <hr />
          <button onClick={()=>navigate('/order')}>Proceed to Checkout</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="promocode-input">
              <input type="text" placeholder='Promo Code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>


      <CartSuggestions />
    </div>
  )
}

export default Cart
