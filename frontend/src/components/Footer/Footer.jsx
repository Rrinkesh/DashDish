import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt=""  width={100}/>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem, dolore. Libero exercitationem aliquid accusamus debitis. Perferendis expedita, blanditiis ut minus odit deleniti cum voluptate sint temporibus quisquam maxime eos. Nihil corporis alias ex magnam. Officiis eum repudiandae non? Neque, exercitationem!</p>

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
            <li>tomato@gmail.com</li>
            </ul>
        </div>

      </div>
      <hr />
      <p className="footercopyright">
        Copyright 2024@ Tomato.com -All Rights are reserved
      </p>
    </div>
  )
}

export default Footer
