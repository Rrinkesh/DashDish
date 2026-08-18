import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
    return (
        <footer className="footer" id="footer">

            <div className="footer-content">

                {/* ================= LEFT ================= */}

                <div className="footer-content-left">

                    <img
                        src={assets.logo}
                        alt="DashDish"
                        className="footer-logo"
                    />

                    <p className="footer-description">
                        Welcome to DashDish, your favorite destination
                        for quick, hot, and delicious meals delivered
                        right to your doorstep.
                    </p>

                    <p className="footer-tagline">
                        <span>🍴</span>
                        Good food. Good mood. Delivered.
                    </p>


                    {/* Social Icons */}

                    <div className="footer-socials">

                        <a href="#" aria-label="Instagram">
                            ◎
                        </a>

                        <a href="#" aria-label="Facebook">
                            f
                        </a>

                        <a href="#" aria-label="Twitter">
                            𝕏
                        </a>

                        <a href="#" aria-label="YouTube">
                            ▶
                        </a>

                    </div>

                </div>


                {/* ================= COMPANY ================= */}

                <div className="footer-content-center">

                    <h2>COMPANY</h2>

                    <ul>
                        <li>
                            <a href="/">Home</a>
                        </li>

                        <li>
                            <a href="/about">About Us</a>
                        </li>

                        <li>
                            <a href="/delivery">Delivery</a>
                        </li>

                        <li>
                            <a href="/privacy">
                                Privacy Policy
                            </a>
                        </li>

                        <li>
                            <a href="/terms">
                                Terms & Conditions
                            </a>
                        </li>
                    </ul>

                </div>


                {/* ================= CONTACT ================= */}

                <div className="footer-content-right">

                    <h2>GET IN TOUCH</h2>

                    <ul>

                        <li>
                            <span>📞</span>

                            <a href="tel:9027348898">
                                9027348898
                            </a>
                        </li>

                        <li>
                            <span>✉️</span>

                            <a href="mailto:rinkeshbhati567@gmail.com">
                                rinkeshbhati567@gmail.com
                            </a>
                        </li>

                        <li>
                            <span>📍</span>

                            <span>
                                Available across your city
                            </span>
                        </li>

                    </ul>


                    {/* App promo */}

                    <div className="footer-app-card">

                        <span className="app-card-icon">
                            ⚡
                        </span>

                        <div>
                            <strong>Fast delivery</strong>

                            <small>
                                Fresh food at your doorstep
                            </small>
                        </div>

                    </div>

                </div>

            </div>


            {/* Divider */}

            <div className="footer-divider"></div>


            {/* Bottom */}

            <div className="footer-bottom">

                <p className="footercopyright">
                    © 2026 DashDish. All rights reserved.
                </p>

                <div className="footer-bottom-links">
                    <a href="/privacy">
                        Privacy
                    </a>

                    <span>•</span>

                    <a href="/terms">
                        Terms
                    </a>
                </div>

            </div>

        </footer>
    )
}

export default Footer