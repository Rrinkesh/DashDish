import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt=""  width={100}/>
            <p>Welcome to DashDish, your favorite destination for quick, hot, and delicious meals delivered right to your doorstep. We partner with the best chefs to ensure every bite is an experience. Taste the difference today!</p>

        </div>
         <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
            </ul>
         </div>
        <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>
            <ul>
            <li>9027348898</li>
            <li>rinkeshbhati567@gmail.com</li>
            </ul>
        </div>

      </div>
      <hr />
      <p className="footercopyright">
        Copyright 2024@ DashDish.com - All Rights reserved
      </p>
    </div>
  )
}

export default Footer
