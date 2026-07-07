import React, { useState, useEffect } from 'react';
import './Coupons.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Coupons = ({ url }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '0', maxDiscountAmount: '', expiryDate: ''
    });

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(url + '/api/coupon/list', { headers: { token } });
            if (res.data.success) {
                setCoupons(res.data.data);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitCoupon = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(url + '/api/coupon/create', formData, { headers: { token } });
            if (res.data.success) {
                toast.success("Coupon created successfully");
                setShowModal(false);
                fetchCoupons();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Error creating coupon");
        }
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(url + '/api/coupon/' + id, { headers: { token } });
            if (res.data.success) {
                toast.success("Coupon deleted");
                fetchCoupons();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Error deleting coupon");
        }
    };

    return (
        <div className="coupons-management add">
            <div className="coupons-header">
                <h2>Coupon Management</h2>
                <button className="create-btn" onClick={() => setShowModal(true)}>+ Create Coupon</button>
            </div>

            <div className="coupons-table-container">
                {loading ? (
                    <div className="loading-skeleton">Loading coupons...</div>
                ) : (
                    <table className="coupons-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon, index) => (
                                <tr key={index}>
                                    <td><strong>{coupon.code}</strong></td>
                                    <td>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}</td>
                                    <td>${coupon.minOrderAmount}</td>
                                    <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => deleteCoupon(coupon._id)} className="btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="no-data">No coupons found. Create one!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create New Coupon</h3>
                        <form onSubmit={submitCoupon}>
                            <div className="form-group">
                                <label>Coupon Code</label>
                                <input required type="text" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. SUMMER50" style={{textTransform: 'uppercase'}}/>
                            </div>
                            <div className="form-group">
                                <label>Discount Type</label>
                                <select name="discountType" value={formData.discountType} onChange={handleChange}>
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FLAT">Flat Amount ($)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Discount Value</label>
                                <input required type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} placeholder="e.g. 10"/>
                            </div>
                            <div className="form-group">
                                <label>Minimum Order Amount ($)</label>
                                <input required type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} />
                            </div>
                            {formData.discountType === 'PERCENTAGE' && (
                                <div className="form-group">
                                    <label>Max Discount Amount ($) - Optional</label>
                                    <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-submit">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
