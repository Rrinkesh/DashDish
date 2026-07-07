import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAdminSocket } from '../../services/socket';
import './DeliveryPartners.css';

const DeliveryPartners = ({ url }) => {
    const [partners, setPartners] = useState([]);
    const [filter, setFilter] = useState('ALL'); // ALL, ONLINE, OFFLINE, BUSY
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '',
        vehicleType: 'Bike', vehicleNumber: '', licenseNumber: ''
    });

    const token = localStorage.getItem('token');

    const fetchPartners = async () => {
        try {
            const response = await axios.get(`${url}/api/delivery/partners`, { headers: { token } });
            if (response.data.success) {
                setPartners(response.data.data);
            }
        } catch (error) {
            toast.error("Error fetching delivery partners");
        }
    };

    useEffect(() => {
        fetchPartners();

        const socket = getAdminSocket();
        const handleStatusChange = () => fetchPartners();
        
        socket.on("driver_status_changed", handleStatusChange);
        socket.on("delivery:accepted", handleStatusChange);
        socket.on("delivery:rejected", handleStatusChange);

        return () => {
            socket.off("driver_status_changed", handleStatusChange);
            socket.off("delivery:accepted", handleStatusChange);
            socket.off("delivery:rejected", handleStatusChange);
        };
    }, []);

    const handleAddPartner = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/delivery/partners/add`, formData, { headers: { token } });
            if (response.data.success) {
                toast.success("Delivery Partner Added!");
                setShowModal(false);
                setFormData({ name: '', email: '', password: '', phone: '', vehicleType: 'Bike', vehicleNumber: '', licenseNumber: '' });
                fetchPartners();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error adding partner");
        }
    };

    const toggleStatus = async (partnerId, currentStatus) => {
        try {
            const response = await axios.post(`${url}/api/delivery/partners/toggle`, {
                partnerId, isActive: !currentStatus
            }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchPartners();
            }
        } catch (error) {
            toast.error("Error toggling status");
        }
    };

    const filteredPartners = partners.filter(p => {
        const matchesFilter = filter === 'ALL' || p.availabilityStatus === filter;
        const driverName = p.userId?.name || '';
        const matchesSearch = driverName.toLowerCase().includes(search.toLowerCase()) || 
                              p.phone.includes(search);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="delivery-partners">
            <div className="header-actions">
                <h2>Delivery Partners</h2>
                <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Partner</button>
            </div>

            <div className="filters">
                <input 
                    type="text" 
                    placeholder="Search name or phone..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="ALL">All Status</option>
                    <option value="ONLINE">Online</option>
                    <option value="BUSY">Busy</option>
                    <option value="OFFLINE">Offline</option>
                </select>
            </div>

            <div className="partners-grid">
                {filteredPartners.map(partner => (
                    <div key={partner._id} className={`partner-card ${!partner.userId?.isActive ? 'inactive' : ''}`}>
                        <div className="card-header">
                            <div className="driver-info">
                                <h3>{partner.userId?.name || 'Unknown Driver'}</h3>
                                <p>{partner.phone}</p>
                            </div>
                            <span className={`status-badge ${partner.availabilityStatus?.toLowerCase()}`}>
                                {partner.availabilityStatus}
                            </span>
                        </div>
                        
                        <div className="card-body">
                            <p><strong>Vehicle:</strong> {partner.vehicleType} ({partner.vehicleNumber})</p>
                            <p><strong>Completed:</strong> {partner.completedOrders?.length || 0}</p>
                            <p><strong>Active Deliveries:</strong> {partner.activeDeliveries || 0}</p>
                            <p><strong>Rating:</strong> ⭐ {partner.rating?.toFixed(1) || '5.0'}</p>
                        </div>
                        
                        <div className="card-actions">
                            <button 
                                className={`toggle-btn ${partner.userId?.isActive ? 'deactivate' : 'activate'}`}
                                onClick={() => toggleStatus(partner._id, partner.userId?.isActive)}
                            >
                                {partner.userId?.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add Delivery Partner</h3>
                        <form onSubmit={handleAddPartner}>
                            <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            <input type="password" placeholder="Password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                            <input type="text" placeholder="Phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                            
                            <select value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}>
                                <option value="Bike">Bike</option>
                                <option value="Scooter">Scooter</option>
                                <option value="Cycle">Cycle</option>
                                <option value="Car">Car</option>
                            </select>
                            
                            <input type="text" placeholder="Vehicle Number" required value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} />
                            <input type="text" placeholder="License Number" required value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} />
                            
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="save-btn">Save Partner</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryPartners;
