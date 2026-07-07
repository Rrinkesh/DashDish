import React, { useEffect, useState, useContext } from 'react';
import './Display.css';
import { StoreContext } from '../../context/Store_context';
import { initSocket, disconnectSocket } from '../../services/socket';
import axios from 'axios';

const Display = () => {
    const { url } = useContext(StoreContext);
    const [preparingOrders, setPreparingOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);

    const fetchActiveOrders = async () => {
        try {
            // We can fetch all orders, or create a specific endpoint for display
            // But since display is public and we don't have token, we should have a public or display token.
            // Wait, we don't have a public active orders endpoint. Let's just create one or use socket to get them.
            // For now, let's just listen to socket events. To bootstrap, we would normally fetch.
            // Let's add a public endpoint `listorders` for display? Admin has it, but requires no auth right now in `server.js`!
            // Wait, does admin listorders require auth? In `orderRoute.js`, `listorders` is public or just doesn't have auth middleware. Let's check `orderroute.js`.
            const response = await axios.get(url + "/api/order/list");
            if (response.data.success) {
                const allOrders = response.data.data;
                setPreparingOrders(allOrders.filter(o => o.status === 'Preparing' || o.status === 'Accepted'));
                setReadyOrders(allOrders.filter(o => o.status === 'Ready'));
            }
        } catch (err) {
            console.error("Display fetch error", err);
        }
    };

    useEffect(() => {
        fetchActiveOrders();

        // Connect as 'display' role which doesn't strictly need a JWT based on our socket logic
        const socket = initSocket('display_token', 'display');

        const handleUpdate = () => {
            fetchActiveOrders(); // Quickest way to sync is refetch on any status change
        };

        socket.on("order:accepted", handleUpdate);
        socket.on("order:preparing", handleUpdate);
        socket.on("order:ready", handleUpdate);
        socket.on("order:completed", handleUpdate);

        return () => {
            disconnectSocket();
        };
    }, []);

    return (
        <div className="display-screen">
            <div className="display-header">
                <h1>Live Token Display</h1>
            </div>
            
            <div className="display-columns">
                <div className="display-col preparing-col">
                    <h2>Preparing</h2>
                    <div className="token-list">
                        {preparingOrders.map(order => (
                            <div key={order._id} className="token-card preparing-token">
                                #{order._id.substring(order._id.length - 4).toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="display-col ready-col">
                    <h2>Ready to Collect</h2>
                    <div className="token-list">
                        {readyOrders.map(order => (
                            <div key={order._id} className="token-card ready-token">
                                #{order._id.substring(order._id.length - 4).toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Display;
