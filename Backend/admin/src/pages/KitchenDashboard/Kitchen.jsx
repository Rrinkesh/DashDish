import React, { useEffect, useState } from 'react';
import './Kitchen.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAdminSocket } from '../../services/socket';

const Kitchen = ({ url }) => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(url + "/api/order/list", { headers: { token } });
            if (response.data.success) {
                // Kitchen only needs active orders
                const active = response.data.data.filter(o => 
                    ["Pending", "food processing...", "Accepted", "Preparing"].includes(o.status)
                );
                // Sort by date (oldest first)
                active.sort((a, b) => new Date(a.date) - new Date(b.date));
                setOrders(active);
            }
        } catch (error) {
            toast.error("Error fetching orders");
        }
    };

    useEffect(() => {
        fetchOrders();

        const socket = getAdminSocket();

        const handleNewOrder = (order) => {
            toast.info("New Order Arrived!");
            fetchOrders();
        };

        const handleUpdate = () => {
            fetchOrders();
        };

        socket.on("order:new", handleNewOrder);
        socket.on("order:updated", handleUpdate);
        socket.on("order:accepted", handleUpdate);
        socket.on("order:preparing", handleUpdate);
        socket.on("order:ready", handleUpdate);
        socket.on("order:completed", handleUpdate);

        return () => {
            socket.off("order:new", handleNewOrder);
            socket.off("order:updated", handleUpdate);
            socket.off("order:accepted", handleUpdate);
            socket.off("order:preparing", handleUpdate);
            socket.off("order:ready", handleUpdate);
            socket.off("order:completed", handleUpdate);
        };
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(url + "/api/order/status", {
                orderid: orderId,
                status: newStatus
            }, { headers: { token } });
            if (response.data.success) {
                toast.success(`Order marked as ${newStatus}`);
                // Local state update isn't strictly necessary since socket will broadcast,
                // but doing it for immediate UI feedback is nice.
                fetchOrders();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    return (
        <div className="kitchen-dashboard">
            <h2>Kitchen Dashboard - Live Orders</h2>
            
            <div className="kitchen-grid">
                {orders.map((order, index) => (
                    <div key={index} className="kitchen-card">
                        <div className="kitchen-card-header">
                            <h3>Order #{order._id.substring(order._id.length - 4).toUpperCase()}</h3>
                            <div className="kitchen-badges">
                                <span className={`order-type-badge ${order.orderType?.toLowerCase() || 'delivery'}`}>
                                    {order.orderType === 'DELIVERY' ? '🚚 DELIVERY' : order.orderType === 'PICKUP' ? '🛍 PICKUP' : `🍽 TABLE ${order.tableNumber || ''}`}
                                </span>
                                <span className={`status-badge ${order.status.replace(/ /g, '-').toLowerCase()}`}>
                                    {order.status === 'food processing...' ? 'Pending' : order.status}
                                </span>
                            </div>
                        </div>
                        
                        <div className="kitchen-card-body">
                            <p className="customer"><strong>Customer:</strong> {order.address.firstname} {order.address.lastname}</p>
                            
                            <div className="order-items">
                                <strong>Items:</strong>
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            <span className="qty">{item.quantity}x</span> {item.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="kitchen-card-actions">
                            {(order.status === "Pending" || order.status === "food processing...") && (
                                <button className="btn-accept" onClick={() => updateStatus(order._id, "Accepted")}>
                                    Accept Order
                                </button>
                            )}
                            {order.status === "Accepted" && (
                                <button className="btn-prepare" onClick={() => updateStatus(order._id, "Preparing")}>
                                    Start Preparing
                                </button>
                            )}
                            {order.status === "Preparing" && (
                                <button className="btn-ready" onClick={() => updateStatus(order._id, "Ready")}>
                                    Mark as Ready
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {orders.length === 0 && (
                    <div className="no-orders">
                        <p>No active orders in the kitchen. Take a breather! ☕</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Kitchen;
