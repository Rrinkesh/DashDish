import React, { useContext, useEffect, useState } from 'react';
import './Myorders.css';
import { StoreContext } from '../../context/Store_context';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const Myorders = () => {
    const { url, token, socket } = useContext(StoreContext);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${url}/api/order/userorders`,
                {},
                {
                    headers: { token }
                }
            );

            if (response.data.success) {
                setData(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [token]);

    /* =========================
       REAL TIME ORDER UPDATES
    ========================= */

    useEffect(() => {
        if (!socket) return;

        const handleOrderUpdate = (updatedOrder) => {
            setData(prevData =>
                prevData.map(order =>
                    order._id === updatedOrder._id
                        ? { ...order, ...updatedOrder }
                        : order
                )
            );
        };

        socket.on('order:accepted', handleOrderUpdate);
        socket.on('order:preparing', handleOrderUpdate);
        socket.on('order:ready', handleOrderUpdate);
        socket.on('order:completed', handleOrderUpdate);
        socket.on('order:updated', handleOrderUpdate);

        return () => {
            socket.off('order:accepted', handleOrderUpdate);
            socket.off('order:preparing', handleOrderUpdate);
            socket.off('order:ready', handleOrderUpdate);
            socket.off('order:completed', handleOrderUpdate);
            socket.off('order:updated', handleOrderUpdate);
        };
    }, [socket]);

    /* =========================
       PROGRESS
    ========================= */

    const getProgressPercentage = (status) => {
        switch (status) {
            case 'Pending':
            case 'food processing...':
                return 20;

            case 'Accepted':
                return 40;

            case 'Preparing':
                return 60;

            case 'Ready':
                return 80;

            case 'Completed':
                return 100;

            default:
                return 0;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
            case 'food processing...':
                return '⏳';

            case 'Accepted':
                return '✓';

            case 'Preparing':
                return '👨‍🍳';

            case 'Ready':
                return '📦';

            case 'Completed':
                return '🎉';

            default:
                return '●';
        }
    };

    const getOrderType = (order) => {
        if (order.orderType === 'DELIVERY') {
            return {
                icon: '🚚',
                text: 'Delivery',
                className: 'delivery'
            };
        }

        if (order.orderType === 'PICKUP') {
            return {
                icon: '🛍',
                text: 'Pickup',
                className: 'pickup'
            };
        }

        return {
            icon: '🍽',
            text: `Dine-In${order.tableNumber ? ` • Table ${order.tableNumber}` : ''}`,
            className: 'dinein'
        };
    };

    /* =========================
       INVOICE
    ========================= */

    const handleDownloadInvoice = async (orderId) => {
        try {
            const res = await axios.post(
                `${url}/api/invoice/generate`,
                { orderId },
                {
                    headers: { token }
                }
            );

            if (res.data.success) {
                const invoiceId = res.data.data._id;

                window.open(
                    `${url}/api/invoice/${invoiceId}/pdf`,
                    '_blank'
                );
            } else {
                alert('Could not generate invoice');
            }
        } catch (error) {
            console.error(error);
            alert('Error generating invoice');
        }
    };

    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <div className="orders-page">
                <div className="orders-loading">
                    <div className="loading-spinner"></div>
                    <h3>Loading your orders...</h3>
                    <p>Please wait a moment</p>
                </div>
            </div>
        );
    }

    /* =========================
       MAIN UI
    ========================= */

    return (
        <div className="myorders">

            {/* PAGE HEADER */}

            <div className="orders-header">

                <div className="orders-header-text">
                    <span className="orders-eyebrow">
                        DASHDISH
                    </span>

                    <h1>
                        My <span>Orders</span>
                    </h1>

                    <p>
                        Track your delicious orders and see their
                        delivery progress in real time.
                    </p>
                </div>

                <div className="orders-header-icon">
                    🍔
                </div>

            </div>

            {/* EMPTY STATE */}

            {data.length === 0 ? (

                <div className="empty-orders">

                    <div className="empty-orders-icon">
                        🛍️
                    </div>

                    <h2>No orders yet</h2>

                    <p>
                        Looks like you haven't ordered anything.
                        Let's fix that!
                    </p>

                    <button onClick={() => navigate('/')}>
                        Explore Menu
                    </button>

                </div>

            ) : (

                <div className="orders-container">

                    {data.map((order, index) => {

                        const orderType = getOrderType(order);

                        const progress =
                            getProgressPercentage(order.status);

                        const total =
                            order.grandTotal ||
                            order.amount ||
                            0;

                        const paymentPaid =
                            order.paymentStatus === 'Paid' ||
                            order.payment ||
                            order.status === 'Completed' ||
                            order.deliveryStatus === 'Delivered';

                        return (

                            <div
                                key={order._id || index}
                                className="order-card"
                            >

                                {/* TOP SECTION */}

                                <div className="order-card-top">

                                    <div className="order-number">

                                        <span>ORDER</span>

                                        <strong>
                                            #{order._id?.slice(-6).toUpperCase()}
                                        </strong>

                                    </div>

                                    <div
                                        className={`order-type ${orderType.className}`}
                                    >
                                        <span>
                                            {orderType.icon}
                                        </span>

                                        {orderType.text}
                                    </div>

                                </div>


                                {/* ORDER CONTENT */}

                                <div className="order-main">

                                    {/* FOOD IMAGE */}

                                    <div className="order-image">

                                        <img
                                            src={assets.parcel}
                                            alt="Order"
                                        />

                                    </div>


                                    {/* DETAILS */}

                                    <div className="order-details">

                                        <h3>
                                            Your Food Order
                                        </h3>

                                        <div className="order-food-list">

                                            {order.items.map(
                                                (item, itemIndex) => (

                                                    <span
                                                        key={itemIndex}
                                                        className="food-chip"
                                                    >
                                                        {item.name}

                                                        <b>
                                                            × {item.quantity}
                                                        </b>
                                                    </span>

                                                )
                                            )}

                                        </div>

                                        <div className="order-meta">

                                            <span>
                                                🛒 {order.items.length} Items
                                            </span>

                                            <span>
                                                💳 {order.paymentMethod || 'Stripe'}
                                            </span>

                                            <span
                                                className={
                                                    paymentPaid
                                                        ? 'paid'
                                                        : 'pending'
                                                }
                                            >
                                                ● {order.paymentStatus ||
                                                    (order.payment
                                                        ? 'Paid'
                                                        : 'Pending')}
                                            </span>

                                        </div>

                                    </div>


                                    {/* PRICE */}

                                    <div className="order-price">

                                        <span>Total</span>

                                        <strong>
                                            ${Number(total).toFixed(2)}
                                        </strong>

                                    </div>

                                </div>


                                {/* TRACKING */}

                                <div className="order-tracking">

                                    <div className="tracking-header">

                                        <div>

                                            <span className="tracking-label">
                                                ORDER STATUS
                                            </span>

                                            <h3>
                                                <span className="status-icon">
                                                    {getStatusIcon(order.status)}
                                                </span>

                                                {order.status}
                                            </h3>

                                        </div>

                                        <span className="live-indicator">
                                            <i></i>
                                            LIVE
                                        </span>

                                    </div>


                                    {/* PROGRESS BAR */}

                                    <div className="progress-wrapper">

                                        <div className="progress-line">

                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${progress}%`
                                                }}
                                            ></div>

                                        </div>

                                        <div className="progress-steps">

                                            <div
                                                className={
                                                    progress >= 20
                                                        ? 'step active'
                                                        : 'step'
                                                }
                                            >
                                                <span>✓</span>
                                                <small>Placed</small>
                                            </div>

                                            <div
                                                className={
                                                    progress >= 40
                                                        ? 'step active'
                                                        : 'step'
                                                }
                                            >
                                                <span>✓</span>
                                                <small>Accepted</small>
                                            </div>

                                            <div
                                                className={
                                                    progress >= 60
                                                        ? 'step active'
                                                        : 'step'
                                                }
                                            >
                                                <span>👨‍🍳</span>
                                                <small>Preparing</small>
                                            </div>

                                            <div
                                                className={
                                                    progress >= 80
                                                        ? 'step active'
                                                        : 'step'
                                                }
                                            >
                                                <span>📦</span>
                                                <small>Ready</small>
                                            </div>

                                            <div
                                                className={
                                                    progress >= 100
                                                        ? 'step active'
                                                        : 'step'
                                                }
                                            >
                                                <span>✓</span>
                                                <small>Delivered</small>
                                            </div>

                                        </div>

                                    </div>


                                    {/* QUEUE */}

                                    {order.queueData &&
                                        order.queueData.ordersAhead >= 0 &&
                                        order.status !== 'Completed' &&
                                        order.status !== 'Ready' && (

                                            <div className="queue-card">

                                                <div className="queue-icon">
                                                    ⏱️
                                                </div>

                                                <div>

                                                    <span>
                                                        Kitchen Queue
                                                    </span>

                                                    <strong>
                                                        {order.queueData.ordersAhead}
                                                        {' '}
                                                        orders ahead
                                                    </strong>

                                                </div>

                                                <div className="eta">

                                                    <span>
                                                        Estimated time
                                                    </span>

                                                    <strong>
                                                        {order.queueData.estimatedMins}
                                                        {' '}
                                                        mins
                                                    </strong>

                                                </div>

                                            </div>

                                        )}


                                    {/* DELIVERY */}

                                    {order.orderType === 'DELIVERY' &&
                                        order.deliveryStatus && (

                                            <div className="delivery-box">

                                                <div>

                                                    <span>
                                                        🚚 Delivery Status
                                                    </span>

                                                    <strong>
                                                        {order.deliveryStatus}
                                                    </strong>

                                                </div>

                                                {order.deliveryStatus !== 'Delivered' && (

                                                    <button
                                                        className="track-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/tracking/${order._id}`
                                                            )
                                                        }
                                                    >
                                                        Track Live Order
                                                        <span>→</span>
                                                    </button>

                                                )}

                                            </div>

                                        )}


                                    {/* PICKUP TOKEN */}

                                    {order.orderType === 'PICKUP' &&
                                        order.pickupToken && (

                                            <div className="pickup-box">

                                                <span>
                                                    🛍 Pickup Token
                                                </span>

                                                <strong>
                                                    {order.pickupToken}
                                                </strong>

                                            </div>

                                        )}

                                </div>


                                {/* FOOTER */}

                                <div className="order-footer">

                                    <span className="order-thanks">
                                        ❤️ Thank you for ordering with DashDish
                                    </span>

                                    <div className="order-actions">

                                        {paymentPaid && (

                                            <button
                                                className="invoice-btn"
                                                onClick={() =>
                                                    handleDownloadInvoice(
                                                        order._id
                                                    )
                                                }
                                            >
                                                🧾 Invoice
                                            </button>

                                        )}

                                        {order.orderType === 'DELIVERY' &&
                                            order.deliveryStatus !== 'Delivered' && (

                                                <button
                                                    className="track-btn footer-track"
                                                    onClick={() =>
                                                        navigate(
                                                            `/tracking/${order._id}`
                                                        )
                                                    }
                                                >
                                                    Track Order →
                                                </button>

                                            )}

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>
    );
};

export default Myorders;