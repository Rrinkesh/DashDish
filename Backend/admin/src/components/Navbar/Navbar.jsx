import React, { useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import './Navbar.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {

    const [showDropdown, setShowDropdown] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [profileData, setProfileData] = useState(null)

    const url =
        import.meta.env.VITE_API_URL ||
        "http://localhost:4000"


    const handleLogout = () => {

        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('restaurantId')

        window.location.href = '/'
    }


    const fetchProfile = async () => {

        try {

            const token = localStorage.getItem('token')

            const response = await axios.post(
                url + "/api/user/profile",
                {},
                {
                    headers: { token }
                }
            )

            if (response.data.success) {

                setProfileData(response.data.data)
                setShowProfileModal(true)

            } else {

                toast.error("Failed to load profile")
            }

        } catch (error) {

            console.error(error)

            toast.error("Error fetching profile")

        }

        setShowDropdown(false)
    }


    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                !event.target.closest(
                    '.profile-container'
                )
            ) {
                setShowDropdown(false)
            }
        }

        document.addEventListener(
            'click',
            handleClickOutside
        )

        return () => {
            document.removeEventListener(
                'click',
                handleClickOutside
            )
        }

    }, [])


    return (

        <>

            {/* ================= NAVBAR ================= */}

            <nav className="navbar">

                <div className="navbar-inner">


                    {/* LOGO */}

                    <a
                        href="/"
                        className="navbar-brand"
                    >

                        <img
                            className="logo"
                            src={assets.logo}
                            alt="DashDish"
                        />

                    </a>


                    {/* RIGHT */}

                    <div className="navbar-right">

                        {/* Status */}

                        <div className="navbar-status">

                            <span className="status-dot"></span>

                            <span>
                                We're online
                            </span>

                        </div>


                        {/* Profile */}

                        <div className="profile-container">

                            <button
                                className="profile-button"
                                onClick={(e) => {

                                    e.stopPropagation()

                                    setShowDropdown(
                                        !showDropdown
                                    )
                                }}
                            >

                                <img
                                    className="profile"
                                    src={assets.profile}
                                    alt="Profile"
                                />

                                <span className="profile-arrow">
                                    {showDropdown ? '⌃' : '⌄'}
                                </span>

                            </button>


                            {/* DROPDOWN */}

                            {showDropdown && (

                                <div className="profile-dropdown">

                                    <div className="dropdown-user">

                                        <img
                                            src={assets.profile}
                                            alt="Profile"
                                        />

                                        <div>
                                            <strong>
                                                My Account
                                            </strong>

                                            <span>
                                                Manage your profile
                                            </span>
                                        </div>

                                    </div>


                                    <div className="dropdown-divider"></div>


                                    <button
                                        onClick={fetchProfile}
                                    >
                                        <span>👤</span>
                                        My Profile
                                    </button>


                                    <button
                                        onClick={() => {
                                            setShowDropdown(false)
                                        }}
                                    >
                                        <span>📦</span>
                                        My Orders
                                    </button>


                                    <div className="dropdown-divider"></div>


                                    <button
                                        onClick={handleLogout}
                                        className="logout-text"
                                    >
                                        <span>↪</span>
                                        Logout
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </nav>


            {/* ================= PROFILE MODAL ================= */}

            {showProfileModal && profileData && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowProfileModal(false)
                    }
                >

                    <div
                        className="modal-content profile-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        {/* HEADER */}

                        <div className="profile-modal-header">

                            <div>

                                <span>
                                    ACCOUNT
                                </span>

                                <h3>
                                    My Profile
                                </h3>

                            </div>


                            <button
                                className="close-btn"
                                onClick={() =>
                                    setShowProfileModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* BODY */}

                        <div className="profile-modal-body">


                            <div className="profile-avatar-wrapper">

                                <img
                                    src={assets.profile}
                                    alt="Avatar"
                                    className="profile-avatar-large"
                                />

                                <span className="avatar-online"></span>

                            </div>


                            <h2>
                                {profileData.name}
                            </h2>

                            <span
                                className={`role-badge ${
                                    profileData.role?.toLowerCase()
                                }`}
                            >
                                {profileData.role}
                            </span>


                            <div className="profile-info">

                                <div className="profile-info-item">

                                    <span className="info-icon">
                                        ✉
                                    </span>

                                    <div>
                                        <small>
                                            Email
                                        </small>

                                        <strong>
                                            {profileData.email}
                                        </strong>
                                    </div>

                                </div>


                                <div className="profile-info-item">

                                    <span className="info-icon">
                                        ☎
                                    </span>

                                    <div>
                                        <small>
                                            Phone
                                        </small>

                                        <strong>
                                            {profileData.phone || 'Not provided'}
                                        </strong>
                                    </div>

                                </div>


                                {profileData.restaurantId && (

                                    <div className="profile-info-item">

                                        <span className="info-icon">
                                            🍴
                                        </span>

                                        <div>

                                            <small>
                                                Restaurant
                                            </small>

                                            <strong>
                                                {
                                                    profileData
                                                        .restaurantId
                                                        .name ||
                                                    'Assigned'
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                )}

                            </div>


                            <button
                                className="modal-close-button"
                                onClick={() =>
                                    setShowProfileModal(false)
                                }
                            >
                                Done
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>

    )
}

export default Navbar