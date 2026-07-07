import React, { useState, useEffect } from 'react'
import  {assets} from '../../assets/assets'
import './Navbar.css'
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const url = import.meta.env.VITE_API_URL || "http://localhost:4000"; // Fallback if url is not passed, ideally should be passed as prop

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('restaurantId');
    window.location.href = '/';
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(url + "/api/user/profile", {}, { headers: { token } });
      if (response.data.success) {
        setProfileData(response.data.data);
        setShowProfileModal(true);
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      toast.error("Error fetching profile");
    }
    setShowDropdown(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="DashDish Logo" />
      <div className="navbar-right">
        
        <div className="profile-container">
          <img 
            className='profile' 
            src={assets.profile}  
            alt="Profile"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          
          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={fetchProfile}>My Profile</button>
              <button onClick={handleLogout} className="logout-text">Logout</button>
            </div>
          )}
        </div>

      </div>

      {showProfileModal && profileData && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>My Profile</h3>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="profile-modal-body">
              <div className="profile-avatar-large">
                <img src={assets.profile} alt="Avatar" />
              </div>
              <div className="profile-info">
                <p><strong>Name:</strong> {profileData.name}</p>
                <p><strong>Role:</strong> <span className={`role-badge ${profileData.role?.toLowerCase()}`}>{profileData.role}</span></p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.phone}</p>
                {profileData.restaurantId && (
                  <p><strong>Restaurant:</strong> {profileData.restaurantId.name || 'Assigned'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Navbar
