import React, { useContext, useEffect, useState } from 'react'
import './Myorders.css';
import { StoreContext } from '../../context/Store_context';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const Myorders = () => {
    const { url, token, socket } = useContext(StoreContext);
    const [data, setdata] = useState([]);
    const navigate = useNavigate();

    const fetchorders = async () => {
        const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
        setdata(response.data.data);
    };

    useEffect(() => {
        if (token) {
            fetchorders();
        }
    }, [token]);

    useEffect(() => {
        if (socket) {
            const handleOrderUpdate = (updatedOrder) => {
                setdata(prevData => prevData.map(order => 
                    order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
                ));
            };

            socket.on("order:accepted", handleOrderUpdate);
            socket.on("order:preparing", handleOrderUpdate);
            socket.on("order:ready", handleOrderUpdate);
            socket.on("order:completed", handleOrderUpdate);
            socket.on("order:updated", handleOrderUpdate);

            return () => {
                socket.off("order:accepted", handleOrderUpdate);
                socket.off("order:preparing", handleOrderUpdate);
                socket.off("order:ready", handleOrderUpdate);
                socket.off("order:completed", handleOrderUpdate);
                socket.off("order:updated", handleOrderUpdate);
            };
        }
    }, [socket]);

    const getProgressPercentage = (status) => {
        switch (status) {
            case "Pending": case "food processing...": return 20;
            case "Accepted": return 40;
            case "Preparing": return 60;
            case "Ready": return 80;
            case "Completed": return 100;
            default: return 0;
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            // First ensure invoice is generated
            const res = await axios.post(url + '/api/invoice/generate', { orderId }, { headers: { token } });
            if(res.data.success) {
                const invoiceId = res.data.data._id;
                // Open PDF in new tab
                window.open(`${url}/api/invoice/${invoiceId}/pdf`, '_blank');
            } else {
                alert("Could not generate invoice");
            }
        } catch(e) {
            console.error(e);
            alert("Error generating invoice");
        }
    }

    return (
        <div className='myorders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={index} className='myorders-order'>
                            <div className="order-type-indicator">
                                <span className={`type-badge ${order.orderType?.toLowerCase() || 'delivery'}`}>
                                    {order.orderType === 'DELIVERY' ? '🚚 DELIVERY' : order.orderType === 'PICKUP' ? '🛍 PICKUP' : `🍽 DINE-IN (Table ${order.tableNumber})`}
                                </span>
                                {order.orderType === 'PICKUP' && order.pickupToken && (
                                    <div className="pickup-token">
                                        Token: <strong>{order.pickupToken}</strong>
                                    </div>
                                )}
                            </div>
                            
                            <img src={assets.parcel} alt="" />
                            <div className="order-details-col">
                                <p>
                                    {order.items.map((item, index) => {
                                        return index === order.items.length - 1
                                            ? item.name + " x " + item.quantity
                                            : item.name + " x " + item.quantity + ", "
                                    })}
                                </p>
                                <p className="amount">${(order.grandTotal || order.amount).toFixed(2)}</p>
                                <p className="items-count">Items: {order.items.length}</p>
                                <p style={{marginTop: '5px', fontSize: '12px', color: '#666'}}>
                                    Payment: <strong style={{color: (order.paymentStatus === 'Paid' || order.payment) ? 'green' : 'orange'}}>{order.paymentStatus || (order.payment ? 'Paid' : 'Pending')}</strong> ({order.paymentMethod || 'Stripe'})
                                </p>
                            </div>
                            
                            <div className="live-tracking-col">
                                <p className="status-badge"><span>&#x25cf;</span><b>{order.status}</b></p>
                                
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill" style={{ width: `${getProgressPercentage(order.status)}%` }}></div>
                                </div>
                                
                                {order.queueData && order.queueData.ordersAhead >= 0 && order.status !== "Completed" && order.status !== "Ready" && (
                                    <div className="queue-info">
                                        <small>Orders ahead: {order.queueData.ordersAhead}</small>
                                        <small className="eta">ETA: {order.queueData.estimatedMins} Mins</small>
                                    </div>
                                )}
                                
                                <div className="delivery-tracking-info" style={{marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                    {order.orderType === 'DELIVERY' && order.deliveryStatus && (
                                        <>
                                            <div className="delivery-status-pill">
                                                Status: <strong>{order.deliveryStatus}</strong>
                                            </div>
                                            {order.deliveryStatus !== 'Delivered' && (
                                                <button className="track-order-btn" onClick={() => navigate(`/tracking/${order._id}`)}>
                                                    Track Order
                                                </button>
                                            )}
                                        </>
                                    )}
                                    
                                    {(order.paymentStatus === 'Paid' || order.payment || order.status === 'Completed' || order.deliveryStatus === 'Delivered') && (
                                        <button className="track-order-btn" style={{background: '#0055a5'}} onClick={() => handleDownloadInvoice(order._id)}>
                                            🧾 Download Invoice
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Myorders
