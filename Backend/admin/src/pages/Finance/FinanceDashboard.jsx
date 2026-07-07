import React, { useState, useEffect } from 'react';
import './Finance.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const FinanceDashboard = ({ url }) => {
    // We would fetch stats from a backend route like /api/admin/finance/stats
    // For now, I'll mock the UI and fetch orders as a proxy.
    const [allOrders, setAllOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(url + '/api/order/list', { headers: { token } });
            if (res.data.success) {
                setAllOrders(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching for finance", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (allOrders.length > 0) {
            const filtered = allOrders.filter(o => {
                const orderDate = new Date(o.date || Date.now());
                const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
                return orderMonth === selectedMonth;
            });
            setOrders(filtered);
        }
    }, [selectedMonth, allOrders]);

    const totalRevenue = orders.filter(o => o.paymentStatus === 'Paid' || o.payment === true).reduce((acc, curr) => acc + (curr.grandTotal || curr.amount), 0);
    const pendingAmount = orders.filter(o => o.paymentStatus === 'Pending' || o.payment === false).reduce((acc, curr) => acc + (curr.grandTotal || curr.amount), 0);

    return (
        <div className="finance-dashboard add">
            <div className="finance-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Finance Overview</h2>
                <div>
                    <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Month: </label>
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)} 
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
            </div>
            
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon green">💰</div>
                    <div className="metric-info">
                        <p>Total Revenue</p>
                        <h3>₹{totalRevenue.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon orange">⏳</div>
                    <div className="metric-info">
                        <p>Pending Payments</p>
                        <h3>₹{pendingAmount.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon blue">🧾</div>
                    <div className="metric-info">
                        <p>Total Orders ({selectedMonth})</p>
                        <h3>{orders.length}</h3>
                    </div>
                </div>
            </div>

            <div className="recent-transactions">
                <h3>Recent Transactions</h3>
                <div className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 10).map((order, index) => (
                                <tr key={index}>
                                    <td>{order._id.substring(0,8)}...</td>
                                    <td>{order.paymentMethod || 'Stripe'}</td>
                                    <td>
                                        <span className={`status-badge ${(order.paymentStatus || (order.payment ? 'Paid' : 'Pending')).toLowerCase()}`}>
                                            {order.paymentStatus || (order.payment ? 'Paid' : 'Pending')}
                                        </span>
                                    </td>
                                    <td><strong>₹{(order.grandTotal || order.amount).toFixed(2)}</strong></td>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
