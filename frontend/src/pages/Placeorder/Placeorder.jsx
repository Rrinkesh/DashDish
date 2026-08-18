import React, { useContext, useEffect, useState } from 'react'
import './Placeorder.css'
import { StoreContext } from '../../context/Store_context'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const AddressAutocomplete = ({ setdata }) => {
  const { ready, value, suggestions: { status, data }, setValue, clearSuggestions } = usePlacesAutocomplete({
    requestOptions: { /* Define search scope here if needed */ },
    debounce: 300,
  });

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      let city = "", state = "", zipcode = "", country = "";
      results[0].address_components.forEach(component => {
        const types = component.types;
        if (types.includes("locality")) city = component.long_name;
        if (types.includes("administrative_area_level_1")) state = component.short_name;
        if (types.includes("postal_code")) zipcode = component.long_name;
        if (types.includes("country")) country = component.long_name;
      });

      setdata(prev => ({ ...prev, street: address, city, state, zipcode, country, lat, lng }));
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="autocomplete-wrapper">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder="Search delivery address..."
        className="autocomplete-input"
        name="street"
      />
      {status === "OK" && (
        <ul className="suggestions-list">
          {data.map(({ place_id, description }) => (
            <li key={place_id} onClick={() => handleSelect(description)}>
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Placeorder = () => {
  const { gettotalamount, token, food_list, cartitems, setcartitems, url } = useContext(StoreContext);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries
  });
  
  const [orderType, setOrderType] = useState('DELIVERY'); // DELIVERY, PICKUP, DINE_IN
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Razorpay, Stripe, COD, PayAtPickup
  
  const [data, setdata] = useState({
    firstname: "", lastname: "", email: "", phone: "", street: "", city: "", state: "", zipcode: "", country: "", lat: null, lng: null
  });
  
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [pickupTime, setPickupTime] = useState("ASAP");
  const [tableNumber, setTableNumber] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponId, setCouponId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/cart")
    else if (gettotalamount() === 0) navigate("/cart")
  }, [token]);

  const onchangehandler = (event) => {
    const { name, value } = event.target;
    setdata(data => ({ ...data, [name]: value }))
  };

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const applyCoupon = async () => {
    if(!couponCode) return;
    try {
      const response = await axios.post(url + '/api/coupon/validate', {
        code: couponCode,
        orderAmount: gettotalamount(),
        orderType: orderType
      }, { headers: { token } });
      
      if(response.data.success) {
        setDiscountAmount(response.data.data.discount);
        setCouponId(response.data.data.couponId);
        alert("Coupon applied successfully!");
      } else {
        alert(response.data.message);
        setDiscountAmount(0);
        setCouponId(null);
      }
    } catch(err) {
      alert("Error applying coupon");
    }
  };

  const deliveryFee = orderType === 'DELIVERY' ? 2 : 0;
  const packingFee = 1; // Default
  const subtotal = gettotalamount();
  const taxAmount = parseFloat(((subtotal - discountAmount) * 0.05).toFixed(2)); // 5% GST
  const grandTotal = subtotal - discountAmount + deliveryFee + packingFee + taxAmount;

  const handleRazorpayPayment = async (orderId) => {
    try {
      const res = await axios.post(url + '/api/payment/create-order', { orderId, amount: grandTotal }, { headers: { token } });
      
      if(!res.data.success) {
        alert("Failed to initiate payment: " + (res.data.message || "Unknown error"));
        return;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TQtrY2pVD7enH4',
        amount: res.data.amount,
        currency: res.data.currency,
        name: "DashDish",
        description: "Order Payment",
        order_id: res.data.id,
        handler: async function (response) {
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderId,
            method: 'Razorpay'
          };
          const verifyRes = await axios.post(url + '/api/payment/verify', verifyData, { headers: { token } });
          if(verifyRes.data.success) {
            setcartitems({});
            navigate(`/myorders`);
          } else {
            alert("Payment Verification Failed");
          }
        },
        prefill: {
          name: data.firstname + " " + data.lastname,
          email: data.email,
          contact: data.phone
        },
        theme: { color: "#0055a5" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Razorpay error: " + (err.response?.data?.message || err.message));
    }
  };

  const placeorder = async (event) => {
    event.preventDefault();

    const orderitems = [];
    food_list.forEach((item) => {
      if (cartitems[item._id] > 0) orderitems.push({ ...item, quantity: cartitems[item._id] });
    });

    let finalPaymentMethod = paymentMethod;
    if(orderType === 'PICKUP' && paymentMethod === 'COD') finalPaymentMethod = 'PayAtPickup';
    if(orderType === 'DINE_IN' && paymentMethod === 'COD') finalPaymentMethod = 'PayAtRestaurant';

    const orderdata = {
      address: data,
      items: orderitems,
      amount: subtotal,
      orderType,
      tableNumber,
      pickupTime,
      deliveryInstructions,
      paymentMethod: finalPaymentMethod,
      couponId,
      discountAmount,
      taxAmount,
      deliveryFee,
      packingFee,
      grandTotal,
    };

    try {
      const response = await axios.post(url + "/api/order/place", orderdata, { headers: { token } });

      if (response.data.success) {
        if (paymentMethod === 'Stripe') {
          window.location.replace(response.data.session_url);
        } else if (paymentMethod === 'Razorpay' || paymentMethod === 'UPI') {
          handleRazorpayPayment(response.data.orderId);
        } else {
          setcartitems({});
          navigate('/myorders');
        }
      } else {
        alert("Order failed: " + (response.data.message || "Server error"));
      }
    } catch (error) {
      console.error(error);
      alert("Server error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={placeorder} className='placeorder'>
      <div className="placeorder-left">
        
        <div className="order-type-selector">
          <div className={`type-tab ${orderType === 'DELIVERY' ? 'active' : ''}`} onClick={() => setOrderType('DELIVERY')}>🚚 Delivery</div>
          <div className={`type-tab ${orderType === 'PICKUP' ? 'active' : ''}`} onClick={() => setOrderType('PICKUP')}>🛍 Pickup</div>
          <div className={`type-tab ${orderType === 'DINE_IN' ? 'active' : ''}`} onClick={() => setOrderType('DINE_IN')}>🍽 Dine-In</div>
        </div>

        <p className='title'>Contact Information</p>
        <div className="multifields">
          <input required name='firstname' onChange={onchangehandler} value={data.firstname} type="text" placeholder='First Name' />
          <input required name='lastname' onChange={onchangehandler} value={data.lastname} type="text" placeholder='Last Name' />
        </div>
        <input required name='email' onChange={onchangehandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='phone' onChange={onchangehandler} value={data.phone} type="text" placeholder='Phone' />

        {orderType === 'DELIVERY' && (
          <div className="delivery-fields">
            <p className='title'>Delivery Address</p>
            {isLoaded ? (
                <AddressAutocomplete setdata={setdata} />
            ) : (
                <input required name='street' onChange={onchangehandler} value={data.street} type="text" placeholder='Street' />
            )}
            <div className="multifields">
              <input required name='city' onChange={onchangehandler} value={data.city} type="text" placeholder='City' />
              <input required name='state' onChange={onchangehandler} value={data.state} type="text" placeholder='State' />
            </div>
            <div className="multifields">
              <input required name='zipcode' onChange={onchangehandler} value={data.zipcode} type="text" placeholder='Zip code' />
              <input required name='country' onChange={onchangehandler} value={data.country} type="text" placeholder='Country' />
            </div>
            <textarea 
              placeholder='Delivery Instructions (e.g. Leave at door)' 
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              className="instructions-input"
            />
          </div>
        )}

        {orderType === 'PICKUP' && (
          <div className="pickup-fields">
            <p className='title'>Pickup Time</p>
            <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="pickup-select">
              <option value="ASAP">ASAP (Usually 15-20 mins)</option>
              <option value="15 Minutes">In 15 Minutes</option>
              <option value="30 Minutes">In 30 Minutes</option>
            </select>
          </div>
        )}

        {orderType === 'DINE_IN' && (
          <div className="dinein-fields">
            <p className='title'>Table Information</p>
            <input required type="text" placeholder='Table Number (e.g. 12)' value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
          </div>
        )}
        
        <p className='title'>Payment Method</p>
        <div className="payment-options">
            <label className="payment-option">
                <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e)=>setPaymentMethod(e.target.value)} />
                <span>UPI (GPay, PhonePe, Paytm)</span>
            </label>
            <label className="payment-option">
                <input type="radio" name="paymentMethod" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e)=>setPaymentMethod(e.target.value)} />
                <span>Pay Online (Razorpay)</span>
            </label>
            <label className="payment-option">
                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e)=>setPaymentMethod(e.target.value)} />
                <span>{orderType === 'DELIVERY' ? 'Cash On Delivery' : orderType === 'PICKUP' ? 'Pay at Pickup' : 'Pay at Restaurant'}</span>
            </label>
        </div>
      </div>
      
      <div className="placeorder-right">
        <div className="carttotal">
          <h2>Bill Summary</h2>
          
          <div className="coupon-section">
              <input type="text" placeholder="Coupon Code" value={couponCode} onChange={e=>setCouponCode(e.target.value)} />
              <button type="button" onClick={applyCoupon}>Apply</button>
          </div>

          <div className="carttotal-details">
            <p>Subtotal</p><p>${subtotal.toFixed(2)}</p>
          </div>
          {discountAmount > 0 && (
            <div className="carttotal-details discount-text">
                <p>Discount</p><p>-${discountAmount.toFixed(2)}</p>
            </div>
          )}
          <hr />
          <div className="carttotal-details">
            <p>Taxes & GST (5%)</p><p>${taxAmount.toFixed(2)}</p>
          </div>
          <div className="carttotal-details">
            <p>Packing Charges</p><p>${packingFee.toFixed(2)}</p>
          </div>
          {orderType === 'DELIVERY' && (
              <div className="carttotal-details">
                <p>Delivery Fee</p><p>${deliveryFee.toFixed(2)}</p>
              </div>
          )}
          <hr />
          <div className="carttotal-details grand-total">
            <p>Grand Total</p><p>${grandTotal.toFixed(2)}</p>
          </div>
        </div>
        <button type='submit'>Proceed to {paymentMethod === 'COD' ? 'Order' : 'Pay'}</button>
      </div>
    </form>
  )
}

export default Placeorder

