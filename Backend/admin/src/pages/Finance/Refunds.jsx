import React, { useState, useEffect } from 'react';
import './Finance.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Refunds = ({ url }) => {
    const [orders, setOrders] = useState([]);
    
    // In a real app we'd fetch refunds specifically. 
    // Here we'll just fetch orders and allow initiating refunds for paid ones.
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(url + '/api/order/list', { headers: { token } });
            if (res.data.success) {
                setOrders(res.data.data.filter(o => o.paymentStatus === 'Paid' || o.payment === true));
            }
        } catch (error) {
            toast.error("Failed to load orders");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const initiateRefund = async (orderId, paymentId, amount) => {
        if(!window.confirm("Initiate full refund for this order?")) return;
        
        try {
            const token = localStorage.getItem('token');
            // If paymentId is null (mock data), we can't really call razorpay refund, but we hit our API anyway
            const res = await axios.post(url + '/api/payment/refund', {
                orderId,
                paymentId: paymentId || 'mock_payment_id',
                reason: "Customer requested cancellation"
            }, { headers: { token } });
            
            if (res.data.success) {
                toast.success("Refund Initiated");
                fetchOrders();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Refund API Error");
        }
    };

    return (
        <div className="finance-dashboard add">
            <div className="finance-header">
                <h2>Refund Management</h2>
                <p>Manage and initiate refunds for paid orders.</p>
            </div>
            
            <div className="transactions-table-container">
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={index}>
                                <td>{order._id.substring(0,8)}...</td>
                                <td>{order.address?.firstname}</td>
                                <td>{order.paymentMethod || 'Stripe'}</td>
                                <td><strong>${(order.grandTotal || order.amount).toFixed(2)}</strong></td>
                                <td>
                                    {order.paymentMethod !== 'COD' ? (
                                        <button className="btn-delete" onClick={()=>initiateRefund(order._id, order.paymentId, order.grandTotal || order.amount)}>
                                            Issue Refund
                                        </button>
                                    ) : (
                                        <span style={{color:'#888'}}>N/A (COD)</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="5" style={{textAlign:'center', padding: '20px'}}>No paid orders available for refund.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Refunds;
