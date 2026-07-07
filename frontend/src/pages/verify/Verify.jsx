import React, { useContext, useEffect } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/Store_context';
import axios from 'axios';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderid = searchParams.get("orderid");

  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const verifypayment = async () => {
    try {
      const response = await axios.post(url + "/api/order/verify", {
        success,
        orderid
      });

      if (response.data.success) {
        navigate("/myorders");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    if (success && orderid) {
      verifypayment();
    } else {
      navigate("/");
    }
  }, [success, orderid]);

  return (
    <div className='verify'>
      <div className='spinner'></div>
      <p>Verifying your payment...</p>
    </div>
  );
};

export default Verify;
