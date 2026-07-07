import React, { useContext, useEffect, useState } from 'react'
import './Loginpop.css'
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/Store_context';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Loginpop = ({ setshowlogin }) => {
    const { url, settoken } = useContext(StoreContext)
    const navigate = useNavigate();
    const [currstate, setcurrstate] = useState('Signup');
    const [data, setdata] = useState({
        name: "",
        password: "",
        email: "",
        phone: "",
    })
    const [otp, setotp] = useState("");
    const onchangehandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setdata(data => ({ ...data, [name]: value }))
    }

   const onlogin = async (event) => {
  event.preventDefault();
  console.log("Login button clicked");

  let newurl = url;
  let sendData = {};

  if (currstate === "Login") {
    newurl += "/api/user/login";
    sendData = {
      email: data.email,
      password: data.password,
    };
  } else {
    newurl += "/api/user/register";
    sendData = data;
  }

  console.log("Final URL:", newurl);

  try {
    const response = await axios.post(newurl, sendData);
    console.log("API response:", response.data);

    if (response.data.success) {
      if (response.data.otpRequired) {
        setcurrstate('OTP');
      } else {
        settoken(response.data.token);
        localStorage.setItem("token", response.data.token);
        navigate('/welcome');
        setshowlogin(false);
      }
    } else {
      alert(response.data.message);
    }

  } catch (error) {
    console.error("Axios error message:", error.message);
    console.error("Axios full error:", error);
    console.error("Server response:", error.response?.data);
    alert("Login failed  check console");
  }
};

const onVerifyOtp = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post(url + "/api/user/verify-otp", {
            email: data.email,
            otp: otp
        });
        if (response.data.success) {
            settoken(response.data.token);
            localStorage.setItem("token", response.data.token);
            navigate('/welcome');
            setshowlogin(false);
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error(error);
        alert("OTP verification failed");
    }
};


    // useEffect(() => { console.log(data) }, [data])
    return (
        <div className='loginpop'>
            <form action="" className='loginpopcontainer' onSubmit={currstate === 'OTP' ? onVerifyOtp : onlogin}>
                <div className="loginpop-title">
                    <h2>
                        {currstate}
                    </h2>
                    <img onClick={() => setshowlogin(false)} src={assets.cross} alt="img" />
                </div>
                <div className="loginpop-inputs">
                    {currstate === "OTP" ? (
                        <input type="text" onChange={(e) => setotp(e.target.value)} value={otp} placeholder='Enter 6-digit OTP' required />
                    ) : (
                        <>
                            {currstate === "Login"?<></> : <input type="text" onChange={onchangehandler} value={data.name} name='name' placeholder='Your name' required />}
                            {currstate === "Login"?<></> : <input type="text" onChange={onchangehandler} value={data.phone} name='phone' placeholder='Your phone number' required />}
                            <input type="email" name='email' onChange={onchangehandler} value={data.email} placeholder='Your email' required />
                            <input type="password" name='password' onChange={onchangehandler} value={data.password} placeholder='Enter ur password' required />
                        </>
                    )}
                </div>
                <button type='submit'>{currstate === "Signup" ? 'Create account' : (currstate === "OTP" ? "Verify OTP" : "Login")}</button>
                <div className="loginpop-condition">
                    <input type="checkbox" required />
                    <p>By continuiuing, i agree to the terms of use &privacy policy</p>

                </div>
                {currstate === "OTP" ? <></> : (currstate === "Login" ? <p> Create new account? <span onClick={() => setcurrstate("Signup")}>Click here</span></p> : <p>Already have an account?<span onClick={() => setcurrstate("Login")}> Login here</span></p>)}


            </form>
        </div>
    )
}

export default Loginpop
