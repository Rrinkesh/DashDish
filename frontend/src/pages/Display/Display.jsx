import React, { useEffect, useState, useContext } from 'react';
import './Display.css';
import { StoreContext } from '../../context/Store_context';
import { initSocket, disconnectSocket } from '../../services/socket';
import axios from 'axios';

const Display = () => {
    const { url } = useContext(StoreContext);

    const [preparingOrders, setPreparingOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchActiveOrders = async () => {
        try {
            const response = await axios.get(url + "/api/order/list");

            if (response.data.success) {
                const allOrders = response.data.data;

                setPreparingOrders(
                    allOrders.filter(
                        o =>
                            o.status === 'Preparing' ||
                            o.status === 'Accepted'
                    )
                );

                setReadyOrders(
                    allOrders.filter(
                        o => o.status === 'Ready'
                    )
                );
            }
        } catch (err) {
            console.error("Display fetch error", err);
        }
    };

    useEffect(() => {
        fetchActiveOrders();

        const clock = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        const socket = initSocket('display_token', 'display');

        const handleUpdate = () => {
            fetchActiveOrders();
        };

        socket.on("order:accepted", handleUpdate);
        socket.on("order:preparing", handleUpdate);
        socket.on("order:ready", handleUpdate);
        socket.on("order:completed", handleUpdate);

        return () => {
            clearInterval(clock);
            disconnectSocket();
        };
    }, []);

    const getToken = (id) => {
        return id
            ? id.substring(id.length - 4).toUpperCase()
            : '----';
    };

    return (
        <div className="display-screen">

            {/* ================= HEADER ================= */}

            <header className="display-header">

                <div className="brand-section">
                    <div className="live-dot"></div>

                    <div>
                        <h1>Order Status</h1>
                        <span>Live Order Display</span>
                    </div>
                </div>

                <div className="time-section">
                    <div className="current-time">
                        {currentTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>

                    <div className="current-date">
                        {currentTime.toLocaleDateString([], {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short'
                        })}
                    </div>
                </div>

            </header>


            {/* ================= STATS ================= */}

            <div className="display-stats">

                <div className="stat-card">
                    <span className="stat-icon">🍳</span>

                    <div>
                        <strong>{preparingOrders.length}</strong>
                        <span>Preparing</span>
                    </div>
                </div>

                <div className="stat-card ready-stat">
                    <span className="stat-icon">✓</span>

                    <div>
                        <strong>{readyOrders.length}</strong>
                        <span>Ready</span>
                    </div>
                </div>

            </div>


            {/* ================= ORDERS ================= */}

            <main className="display-columns">

                {/* PREPARING */}

                <section className="display-col preparing-col">

                    <div className="column-header">

                        <div className="column-title">
                            <span className="column-icon">🍳</span>

                            <div>
                                <h2>Preparing</h2>
                                <p>Your order is being prepared</p>
                            </div>
                        </div>

                        <span className="order-count">
                            {preparingOrders.length}
                        </span>

                    </div>


                    <div className="token-list">

                        {preparingOrders.length === 0 ? (

                            <div className="empty-state">
                                <div className="empty-icon">🍽️</div>
                                <h3>No orders preparing</h3>
                                <p>New orders will appear here</p>
                            </div>

                        ) : (

                            preparingOrders.map(order => (

                                <div
                                    key={order._id}
                                    className="token-card preparing-token"
                                >
                                    <span className="token-label">
                                        TOKEN
                                    </span>

                                    <span className="token-number">
                                        #{getToken(order._id)}
                                    </span>

                                    <span className="token-status">
                                        Preparing...
                                    </span>
                                </div>

                            ))

                        )}

                    </div>

                </section>


                {/* READY */}

                <section className="display-col ready-col">

                    <div className="column-header">

                        <div className="column-title">
                            <span className="column-icon ready-icon">
                                ✓
                            </span>

                            <div>
                                <h2>Ready for Pickup</h2>
                                <p>Please collect your order</p>
                            </div>
                        </div>

                        <span className="order-count ready-count">
                            {readyOrders.length}
                        </span>

                    </div>


                    <div className="token-list">

                        {readyOrders.length === 0 ? (

                            <div className="empty-state">
                                <div className="empty-icon">✓</div>

                                <h3>No orders ready</h3>

                                <p>
                                    We'll notify you when your order is ready
                                </p>
                            </div>

                        ) : (

                            readyOrders.map(order => (

                                <div
                                    key={order._id}
                                    className="token-card ready-token"
                                >
                                    <span className="token-label">
                                        PLEASE COLLECT
                                    </span>

                                    <span className="token-number">
                                        #{getToken(order._id)}
                                    </span>

                                    <span className="token-status">
                                        Ready!
                                    </span>
                                </div>

                            ))

                        )}

                    </div>

                </section>

            </main>


            {/* ================= FOOTER ================= */}

            <footer className="display-footer">
                <span>Thank you for choosing us ❤️</span>
                <span>•</span>
                <span>Please keep your token number ready</span>
            </footer>

        </div>
    );
};

export default Display;