import React, { useContext, useEffect, useState } from 'react';
import './MyProfile.css';
import { StoreContext } from '../../context/Store_context';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
    const { url, token } = useContext(StoreContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        
        if (!token) {
            navigate('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                // Using POST to ensure req.body is available for the authmiddleware in the backend
                const response = await axios.post(url + "/api/user/profile", {}, { headers: { token } });
                if (response.data.success) {
                    setUserData(response.data.data);
                } else {
                    toast.error(response.data.message || "Failed to load profile data");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token, url, navigate]);

    if (loading) {
        return <div className="profile-loading">Loading Profile...</div>;
    }

    if (!userData) {
        return <div className="profile-loading">Profile not found.</div>;
    }

    // Format address if it exists
    const formatAddress = (addr) => {
        if (!addr || Object.keys(addr).length === 0) return "No address provided.";
        // if it's an object from orders like { street, city, state, zip }
        if (typeof addr === 'object') {
            return Object.values(addr).filter(Boolean).join(", ");
        }
        return String(addr);
    };

    return (
        <div className="my-profile">
            <div className="profile-container">
                <div className="profile-header">
                    <img src={userData.profileImage || assets.profile} alt="Profile" className="profile-avatar" />
                    <h2>{userData.name}</h2>
                    <p className={`profile-role ${userData.role ? userData.role.toLowerCase() : 'customer'}`}>
                        {userData.role ? userData.role.replace('_', ' ') : 'CUSTOMER'}
                    </p>
                    {userData.restaurantId && userData.restaurantId.name && (
                        <p className="profile-restaurant">
                            <i className="fa-solid fa-store"></i> {userData.restaurantId.name}
                        </p>
                    )}
                </div>
                
                <div className="profile-details">
                    <h3>Personal Information</h3>
                    
                    <div className="detail-group">
                        <label>Email Address</label>
                        <p>{userData.email}</p>
                    </div>
                    
                    <hr />
                    
                    <div className="detail-group">
                        <label>Phone Number</label>
                        <p>{userData.phone || "Not provided"}</p>
                    </div>
                    
                    <hr />
                    
                    <div className="detail-group">
                        <label>Delivery Address</label>
                        <p>{formatAddress(userData.address)}</p>
                    </div>
                    
                    <hr />
                    
                    <div className="detail-group">
                        <label>Account Status</label>
                        <p>
                            <span className={userData.isVerified ? "status-badge verified" : "status-badge unverified"}>
                                {userData.isVerified ? "Verified" : "Unverified"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
