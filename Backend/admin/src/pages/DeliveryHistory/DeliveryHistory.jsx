import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './DeliveryHistory.css';

const DeliveryHistory = ({ url }) => {
    const [historyOrders, setHistoryOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Assuming /api/order/list returns orders assigned to this driver
                const response = await axios.get(`${url}/api/order/list`, { headers: { token } });
                if (response.data.success) {
                    const allOrders = response.data.data;
                    const history = allOrders.filter(o => 
                        ['Delivered', 'Completed', 'Cancelled', 'Driver Rejected'].includes(o.deliveryStatus)
                    );
                    setHistoryOrders(history);
                }
            } catch (error) {
                toast.error("Error fetching history");
            }
        };
        fetchHistory();
    }, [url, token]);

    const filteredHistory = historyOrders.filter(order => {
        const matchStatus = filterStatus === 'ALL' || order.deliveryStatus === filterStatus;
        const orderDate = new Date(order.date).toISOString().split('T')[0];
        const matchDate = filterDate === '' || orderDate === filterDate;
        return matchStatus && matchDate;
    });

    return (
        <div className="delivery-history">
            <h2>Delivery History</h2>
            
            <div className="filters">
                <input 
                    type="date" 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)} 
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">All Statuses</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Driver Rejected">Rejected</option>
                </select>
                <button className="clear-btn" onClick={() => {setFilterDate(''); setFilterStatus('ALL')}}>Clear Filters</button>
            </div>

            <div className="history-list">
                {filteredHistory.length === 0 ? (
                    <p>No history found for the selected filters.</p>
                ) : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Address</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id.substring(order._id.length - 4).toUpperCase()}</td>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                    <td>{order.address.firstname}</td>
                                    <td>{order.address.street}, {order.address.city}</td>
                                    <td>${order.amount}.00</td>
                                    <td><span className={`status-badge ${order.deliveryStatus.replace(' ', '-').toLowerCase()}`}>{order.deliveryStatus}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DeliveryHistory;
