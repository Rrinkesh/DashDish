import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/Store_context';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import './Tracking.css';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '15px' };
const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // Fallback

const statusSteps = [
    'Pending',
    'Preparing',
    'Ready',
    'Driver Assigned',
    'Picked Up',
    'On The Way',
    'Nearby',
    'Delivered'
];

const Tracking = () => {
    const { orderId } = useParams();
    const { url, token, socket } = useContext(StoreContext);
    
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const [order, setOrder] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    
    const fetchOrderDetails = async () => {
        try {
            const response = await axios.post(`${url}/api/order/userorders`, {}, { headers: { token } });
            if (response.data.success) {
                const currentOrder = response.data.data.find(o => o._id === orderId);
                if (currentOrder) {
                    setOrder(currentOrder);
                    if (currentOrder.driverCurrentLocation && currentOrder.driverCurrentLocation.lat) {
                        setDriverLocation(currentOrder.driverCurrentLocation);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching order details", error);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
        
        if (socket && orderId) {
            socket.emit("join_order_room", orderId);

            const handleLocationUpdate = (data) => {
                if (data.orderId === orderId) {
                    setDriverLocation(data.location);
                    setOrder(prev => ({
                        ...prev,
                        estimatedArrival: data.eta,
                        remainingDistance: data.distance
                    }));
                }
            };

            const handleOrderUpdate = () => {
                fetchOrderDetails();
                toast.info("Order status updated!");
            };

            socket.on("driver_location_updated", handleLocationUpdate);
            socket.on("eta_updated", handleLocationUpdate);
            socket.on("order:updated", handleOrderUpdate);

            return () => {
                socket.off("driver_location_updated", handleLocationUpdate);
                socket.off("eta_updated", handleLocationUpdate);
                socket.off("order:updated", handleOrderUpdate);
            };
        }
    }, [orderId, socket]);

    useEffect(() => {
        // Calculate route if we have driver location and customer location
        if (order && driverLocation && order.address.lat && window.google) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: driverLocation,
                    destination: { lat: parseFloat(order.address.lat), lng: parseFloat(order.address.lng) },
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    }
                }
            );
        }
    }, [driverLocation, order]);

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');

    const submitRating = async () => {
        try {
            const res = await axios.post(`${url}/api/order/rate-driver`, { orderId, rating, review }, { headers: { token } });
            if (res.data.success) {
                toast.success('Thank you for rating!');
                setShowRatingModal(false);
                fetchOrderDetails();
            }
        } catch (error) {
            toast.error('Error submitting rating');
        }
    };

    useEffect(() => {
        if (order && order.deliveryStatus === 'Delivered' && !order.driverRating) {
            setShowRatingModal(true);
        }
    }, [order]);

    if (!order) return <div className="tracking-loading">Loading order details...</div>;

    const currentStepIndex = statusSteps.indexOf(order.deliveryStatus || 'Pending');

    return (
        <div className="tracking-page">
            <div className="tracking-header">
                <h2>Track Your Order</h2>
                <p>Order #{order._id.substring(order._id.length - 4).toUpperCase()}</p>
            </div>

            <div className="status-timeline">
                {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isActive = index === currentStepIndex;
                    return (
                        <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="step-circle">{isCompleted ? '✓' : ''}</div>
                            <p>{step}</p>
                        </div>
                    );
                })}
            </div>

            <div className="tracking-content">
                <div className="map-section">
                    {!isLoaded ? (
                        <p>Loading Map...</p>
                    ) : (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={driverLocation || (order.address.lat ? { lat: parseFloat(order.address.lat), lng: parseFloat(order.address.lng) } : defaultCenter)}
                            zoom={14}
                            options={{ disableDefaultUI: true }}
                        >
                            {driverLocation && (
                                <Marker 
                                    position={driverLocation} 
                                    icon={{ url: "https://cdn-icons-png.flaticon.com/512/3206/3206015.png", scaledSize: new window.google.maps.Size(40, 40) }}
                                />
                            )}
                            {order.address.lat && (
                                <Marker 
                                    position={{ lat: parseFloat(order.address.lat), lng: parseFloat(order.address.lng) }} 
                                    icon={{ url: "https://cdn-icons-png.flaticon.com/512/2555/2555523.png", scaledSize: new window.google.maps.Size(40, 40) }}
                                />
                            )}
                            {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
                        </GoogleMap>
                    )}
                </div>

                <div className="info-section">
                    <div className="eta-card">
                        <h3>Estimated Arrival</h3>
                        <h2>{order.estimatedArrival || 'Calculating...'}</h2>
                        <p>{order.remainingDistance || ''} remaining</p>
                    </div>
                    
                    {order.deliveryOTP && order.deliveryStatus !== 'Delivered' && (
                        <div className="otp-card">
                            <h3>Delivery PIN</h3>
                            <div className="otp-display">{order.deliveryOTP}</div>
                            <p>Share this with the driver upon arrival.</p>
                        </div>
                    )}

                    {order.deliveryPartnerId && (
                        <div className="driver-card">
                            <div className="driver-avatar">
                                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Driver" />
                            </div>
                            <div className="driver-details">
                                <h4>Your Driver is on the way!</h4>
                                {/* In a real app, populate from deliveryPartnerId reference */}
                                <p>Vehicle: assigned vehicle</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showRatingModal && (
                <div className="rating-modal-overlay">
                    <div className="rating-modal">
                        <h2>Rate Your Driver</h2>
                        <p>How was your delivery experience?</p>
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                    key={star} 
                                    className={`star ${rating >= star ? 'selected' : ''}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea 
                            placeholder="Optional comment..." 
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                        />
                        <button className="submit-rating-btn" onClick={submitRating}>Submit Rating</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tracking;
