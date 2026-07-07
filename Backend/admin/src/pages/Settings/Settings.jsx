import React, { useState, useEffect } from 'react';
import './Settings.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Settings = ({ url }) => {
    const [settings, setSettings] = useState({
        name: '',
        phone: '',
        email: '',
        openingHours: '',
        closingHours: '',
        description: '',
        logo: '',
        address: { street: '', city: '', state: '', zipcode: '', country: '' }
    });
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(url + '/api/admin/restaurant', {
                    headers: { token }
                });
                if (response.data.success && response.data.data) {
                    setSettings({
                        ...settings,
                        ...response.data.data,
                        address: response.data.data.address || settings.address
                    });
                }
            } catch (error) {
                console.error(error);
                // toast.error("Error fetching settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setSettings({
                ...settings,
                address: { ...settings.address, [field]: value }
            });
        } else {
            setSettings({ ...settings, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(url + '/api/admin/restaurant', settings, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success("Settings updated successfully");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating settings");
        }
    };

    if (loading) return <div className="settings-container add"><p>Loading settings...</p></div>;

    return (
        <div className="settings-container add">
            <div className="settings-header">
                <h2>Restaurant Settings</h2>
                <p>Manage your restaurant's public profile and operational details.</p>
            </div>

            <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Restaurant Name</label>
                            <input type="text" name="name" value={settings.name} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Phone Number</label>
                            <input type="text" name="phone" value={settings.phone} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Contact Email</label>
                            <input type="email" name="email" value={settings.email} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="input-group full">
                        <label>Business Description</label>
                        <textarea name="description" value={settings.description} onChange={handleChange} rows="3"></textarea>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Operating Hours</h3>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Opening Time</label>
                            <input type="time" name="openingHours" value={settings.openingHours} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Closing Time</label>
                            <input type="time" name="closingHours" value={settings.closingHours} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Location</h3>
                    <div className="input-group full">
                        <label>Street Address</label>
                        <input type="text" name="address.street" value={settings.address.street} onChange={handleChange} />
                    </div>
                    <div className="input-row">
                        <div className="input-group">
                            <label>City</label>
                            <input type="text" name="address.city" value={settings.address.city} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>State</label>
                            <input type="text" name="address.state" value={settings.address.state} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Zipcode</label>
                            <input type="text" name="address.zipcode" value={settings.address.zipcode} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="settings-actions">
                    <button type="submit" className="btn-save">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
