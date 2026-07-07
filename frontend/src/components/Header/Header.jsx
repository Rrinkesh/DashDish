import React from 'react'
import './Header.css'
import { assets } from '../../assets/assets'

const Header = () => {
    return (
        <div className='header'>
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="header-video-background"
            >
                <source src={assets.header_video} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="header-content">
                <h2>Order ur favourite food here </h2>
                <p>Choose from diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise .</p>
                <a href="/#exploremenu" className="view-menu-btn">View Menu</a>
            </div>
        </div>
    )
}

export default Header
