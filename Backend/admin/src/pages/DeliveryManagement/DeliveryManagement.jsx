import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAdminSocket } from '../../services/socket';
import './DeliveryManagement.css';

const DeliveryManagement = ({ url }) => {
    const [deliveries, setDeliveries] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState(null);
    const token = localStorage.getItem('token');

    const [allDeliveries, setAllDeliveries] = useState([]);
    const [stats, setStats] = useState({ completed: 0, cancelled: 0, avgTime: '32m', topDriver: 'N/A' });

    const fetchData = async () => {
        try {
            // Fetch orders
            const orderRes = await axios.get(`${url}/api/order/list`, { headers: { token } });
            if (orderRes.data.success) {
                const dOrders = orderRes.data.data.filter(o => o.orderType === 'DELIVERY');
                setAllDeliveries(dOrders);

                const activeOrders = dOrders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
                setDeliveries(activeOrders);

                const completed = dOrders.filter(o => o.deliveryStatus === 'Delivered').length;
                const cancelled = dOrders.filter(o => o.deliveryStatus === 'Cancelled').length;
                
                setStats({
                    completed,
                    cancelled,
                    avgTime: '28m', // Mock for now
                    topDriver: 'Driver #1' // Mock for now
                });
            }
        } catch (error) {
            toast.error("Error fetching data");
        }
    };

    const fetchDrivers = async () => {
        try {
            const driverRes = await axios.get(`${url}/api/delivery/available`, { headers: { token } });
            if (driverRes.data.success) {
                setAvailableDrivers(driverRes.data.data);
            }
        } catch (error) {
            toast.error("Error fetching available drivers");
        }
    };

    useEffect(() => {
        fetchData();
        const socket = getAdminSocket();
        
        const handleUpdate = () => fetchData();

        socket.on("order:new", handleUpdate);
        socket.on("delivery:updated", handleUpdate);
        socket.on("delivery:rejected", handleUpdate);
        socket.on("order:updated", handleUpdate);
        socket.on("driver_status_changed", () => {
            if (showModal) fetchDrivers();
        });

        return () => {
            socket.off("order:new", handleUpdate);
            socket.off("delivery:updated", handleUpdate);
            socket.off("delivery:rejected", handleUpdate);
            socket.off("order:updated", handleUpdate);
            socket.off("driver_status_changed");
        };
    }, [showModal]);

    const openAssignModal = (orderId) => {
        setSelectedOrderForAssignment(orderId);
        fetchDrivers();
        setShowModal(true);
    };

    const assignDriver = async (driverId) => {
        try {
            const response = await axios.post(`${url}/api/delivery/assign`, {
                orderId: selectedOrderForAssignment, driverId
            }, { headers: { token } });

            if (response.data.success) {
                toast.success("Driver assigned successfully!");
                setShowModal(false);
                fetchData();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error assigning driver");
        }
    };

    return (
        <div className="delivery-management">
            <h2>Delivery Management</h2>

            <div className="delivery-widget">
                <div className="widget-card">
                    <h3>{deliveries.length}</h3>
                    <p>Pending / Active</p>
                </div>
                <div className="widget-card">
                    <h3>{availableDrivers.length}</h3>
                    <p>Available Drivers</p>
                </div>
                <div className="widget-card">
                    <h3>{stats.completed}</h3>
                    <p>Total Completed</p>
                </div>
                <div className="widget-card">
                    <h3>{stats.avgTime}</h3>
                    <p>Avg ETA</p>
                </div>
            </div>

            <div className="deliveries-list">
                {deliveries.length === 0 ? (
                    <p>No active deliveries to manage.</p>
                ) : (
                    <table className="delivery-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id.substring(order._id.length - 4).toUpperCase()}</td>
                                    <td>{order.address.firstname}</td>
                                    <td>{order.address.street}, {order.address.city}</td>
                                    <td><span className="status-badge">{order.deliveryStatus || 'Pending'}</span></td>
                                    <td>
                                        {['Pending', 'Waiting For Assignment'].includes(order.deliveryStatus || 'Pending') ? (
                                            <button className="open-modal-btn" onClick={() => openAssignModal(order._id)}>
                                                Assign Partner
                                            </button>
                                        ) : (
                                            <span className="assigned-text">{order.deliveryStatus}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>Assign Delivery Partner</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        
                        <div className="drivers-grid">
                            {availableDrivers.length === 0 ? (
                                <p>No drivers currently ONLINE. Please ask a driver to go ONLINE.</p>
                            ) : (
                                availableDrivers.map(driver => (
                                    <div key={driver._id} className="driver-card">
                                        <div className="driver-card-header">
                                            <h4>{driver.userId.name}</h4>
                                            <span className="rating">⭐ {driver.rating.toFixed(1)}</span>
                                        </div>
                                        <div className="driver-details">
                                            <p><strong>Vehicle:</strong> {driver.vehicleType}</p>
                                            <p><strong>Phone:</strong> {driver.phone || driver.userId.phone}</p>
                                            <p><strong>Completed:</strong> {driver.completedOrders.length}</p>
                                            <p><strong>Active:</strong> {driver.activeDeliveries}</p>
                                        </div>
                                        <button className="assign-btn" onClick={() => assignDriver(driver._id)}>
                                            Assign
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryManagement;
