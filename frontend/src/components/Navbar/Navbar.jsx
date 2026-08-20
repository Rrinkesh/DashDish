import React, { useContext, useEffect, useRef, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/Store_context';

const Navbar = ({ setshowlogin }) => {

    const [menu, setmenu] = useState('Home');
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const { gettotalamount, token, settoken } = useContext(StoreContext);

    const navigate = useNavigate();

    const profileRef = useRef(null);


    /* =========================================
       LOGOUT
    ========================================= */

    const logout = () => {
        localStorage.removeItem("token");
        settoken(null);
        setShowProfileDropdown(false);
        navigate("/");
    };


    /* =========================================
       MOBILE APP
    ========================================= */

    const handleMobileAppClick = (e) => {
        e.preventDefault();

        setmenu('Mobile-app');

        toast.info("App is under developing mode");
    };


    /* =========================================
       PROFILE CLICK
    ========================================= */

    const handleProfileClick = (e) => {
        e.stopPropagation();

        setShowProfileDropdown(prev => !prev);
    };


    /* =========================================
       CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    ========================================= */

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowProfileDropdown(false);
            }

        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };

    }, []);


    /* =========================================
       NAVIGATION HELPERS
    ========================================= */

    const handleProfileNavigation = () => {

        setShowProfileDropdown(false);

        navigate('/myprofile');

    };


    const handleOrdersNavigation = () => {

        setShowProfileDropdown(false);

        navigate('/myorders');

    };


    return (

        <div className='navbar'>

            {/* =====================================
                LOGO
            ===================================== */}

            <Link to='/'>
                <img
                    src={assets.logo}
                    alt="DashDish"
                    className="logo"
                />
            </Link>


            {/* =====================================
                NAVIGATION MENU
            ===================================== */}

            <ul className='navbar-menu'>

                <Link
                    to='/'
                    onClick={() => setmenu('Home')}
                    className={menu === 'Home' ? 'active' : ''}
                >
                    Home
                </Link>


                <a
                    href='/#exploremenu'
                    onClick={() => setmenu('Menu')}
                    className={menu === 'Menu' ? 'active' : ''}
                >
                    Menu
                </a>


                <a
                    href='#'
                    onClick={handleMobileAppClick}
                    className={
                        menu === 'Mobile-app'
                            ? 'active'
                            : ''
                    }
                >
                    Mobile-app
                </a>


                <a
                    href='/#footer'
                    onClick={() => setmenu('Contact us')}
                    className={
                        menu === 'Contact us'
                            ? 'active'
                            : ''
                    }
                >
                    Contact us
                </a>

            </ul>


            {/* =====================================
                RIGHT SIDE
            ===================================== */}

            <div className="navbar-right">


                {/* SEARCH */}

                <img
                    src={assets.search_icon}
                    alt="Search"
                    className="navbar-search"
                />


                {/* =================================
                    CART
                ================================= */}

                <div className="navbar-search-icon">

                    <Link to='/cart'>

                        <img
                            src={assets.basket_icon}
                            alt="Cart"
                        />

                    </Link>


                    <div
                        className={
                            gettotalamount() === 0
                                ? ""
                                : "dot"
                        }
                    ></div>

                </div>


                {/* =================================
                    AUTHENTICATED USER
                ================================= */}

                {!token ? (

                    <button
                        onClick={() => setshowlogin(true)}
                    >
                        Signin
                    </button>

                ) : (

                    /* =================================
                       PROFILE
                    ================================= */

                    <div
                        className={`navbar-profile ${
                            showProfileDropdown
                                ? 'profile-open'
                                : ''
                        }`}
                        ref={profileRef}
                    >


                        {/* PROFILE BUTTON */}

                        <button
                            type="button"
                            className="profile-trigger"
                            onClick={handleProfileClick}
                            aria-label="Open profile menu"
                            aria-expanded={showProfileDropdown}
                        >

                            <img
                                src={assets.profile}
                                alt="Profile"
                            />

                            <span className="profile-chevron">
                                {showProfileDropdown ? '▲' : '▼'}
                            </span>

                        </button>


                        {/* =================================
                            DROPDOWN
                        ================================= */}

                        {showProfileDropdown && (

                            <div className="nav-profile-dropdown">


                                {/* DROPDOWN HEADER */}

                                <div className="profile-dropdown-header">

                                    <div className="profile-dropdown-avatar">

                                        <img
                                            src={assets.profile}
                                            alt="Profile"
                                        />

                                    </div>

                                    <div>

                                        <h4>My Account</h4>

                                        <span>
                                            Welcome back 👋
                                        </span>

                                    </div>

                                </div>


                                <div className="dropdown-divider"></div>


                                {/* MY PROFILE */}

                                <div
                                    className="profile-dropdown-item"
                                    onClick={handleProfileNavigation}
                                >

                                    <div className="dropdown-icon">

                                        <img
                                            src={assets.profile}
                                            alt=""
                                        />

                                    </div>

                                    <div className="dropdown-text">

                                        <strong>
                                            My Profile
                                        </strong>

                                        <span>
                                            View your profile
                                        </span>

                                    </div>

                                    <span className="dropdown-arrow">
                                        →
                                    </span>

                                </div>


                                {/* MY ORDERS */}

                                <div
                                    className="profile-dropdown-item"
                                    onClick={handleOrdersNavigation}
                                >

                                    <div className="dropdown-icon">

                                        <img
                                            src={assets.bag}
                                            alt=""
                                        />

                                    </div>

                                    <div className="dropdown-text">

                                        <strong>
                                            My Orders
                                        </strong>

                                        <span>
                                            Track your orders
                                        </span>

                                    </div>

                                    <span className="dropdown-arrow">
                                        →
                                    </span>

                                </div>

                                {/* ORDER HISTORY */}
                                <div
                                    className="profile-dropdown-item"
                                    onClick={() => {
                                        setShowProfileDropdown(false);
                                        navigate('/history');
                                    }}
                                >
                                    <div className="dropdown-icon">
                                        <img
                                            src={assets.bag}
                                            alt=""
                                        />
                                    </div>
                                    <div className="dropdown-text">
                                        <strong>
                                            Order History
                                        </strong>
                                        <span>
                                            View past orders
                                        </span>
                                    </div>
                                    <span className="dropdown-arrow">
                                        →
                                    </span>
                                </div>


                                <div className="dropdown-divider"></div>


                                {/* LOGOUT */}

                                <div
                                    className="profile-dropdown-item logout-item"
                                    onClick={logout}
                                >

                                    <div className="dropdown-icon logout-icon">

                                        <img
                                            src={assets.logout}
                                            alt=""
                                        />

                                    </div>

                                    <div className="dropdown-text">

                                        <strong>
                                            Logout
                                        </strong>

                                        <span>
                                            Sign out of your account
                                        </span>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                )}

            </div>

        </div>

    );

};

export default Navbar;