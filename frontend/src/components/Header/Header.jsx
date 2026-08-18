import React from 'react'
import './Header.css'
import { assets } from '../../assets/assets'

const Header = () => {
    return (
        <div className="header">

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="header-video-background"
            >
                <source
                    src={assets.header_video}
                    type="video/mp4"
                />

                Your browser does not support the video tag.
            </video>


            {/* Dark Overlay */}
            <div className="header-overlay"></div>


            {/* Hero Content */}
            <div className="header-content">

                <span className="hero-badge">
                    🔥 FRESH • FAST • DELICIOUS
                </span>


                <h1>
                    Delicious food,
                    <span> delivered to you.</span>
                </h1>


                <p>
                    Discover a world of delicious flavors prepared
                    with fresh ingredients and delivered straight
                    to your doorstep.
                </p>


                <div className="header-actions">

                    <a
                        href="/#exploremenu"
                        className="view-menu-btn"
                    >
                        Explore Menu
                        <span>→</span>
                    </a>

                    <div className="delivery-info">
                        <span className="delivery-icon">
                            🚴
                        </span>

                        <div>
                            <strong>Fast Delivery</strong>
                            <small>At your doorstep</small>
                        </div>
                    </div>

                </div>

            </div>


            {/* Right Floating Card */}
            <div className="hero-floating-card">

                <div className="floating-icon">
                    ⭐
                </div>

                <div>
                    <strong>Top Rated</strong>
                    <span>Loved by foodies</span>
                </div>

            </div>


            {/* Bottom Info */}
            <div className="hero-bottom-info">

                <div>
                    <span>🍃</span>
                    <p>
                        <strong>Fresh Ingredients</strong>
                        <small>Quality you can taste</small>
                    </p>
                </div>

                <div>
                    <span>⚡</span>
                    <p>
                        <strong>Quick Delivery</strong>
                        <small>Hot & fresh</small>
                    </p>
                </div>

                <div>
                    <span>❤️</span>
                    <p>
                        <strong>Made With Love</strong>
                        <small>Every single order</small>
                    </p>
                </div>

            </div>

        </div>
    )
}

export default Header