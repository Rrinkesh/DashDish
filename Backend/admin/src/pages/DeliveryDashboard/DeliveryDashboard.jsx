import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAdminSocket } from '../../services/socket';
import { GoogleMap, useLoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import './DeliveryDashboard.css';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '10px' };
const defaultCenter = { lat: 40.7128, lng: -74.0060 };

const DeliveryDashboard = ({ url }) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const [status, setStatus] = useState('OFFLINE');
    const [deliveries, setDeliveries] = useState([]);
    const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0, cancelled: 0, rating: 5.0 });
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [etaData, setEtaData] = useState({ distance: '', duration: '' });
    
    // Phase 3C States
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState(null);
    const [otpInput, setOtpInput] = useState('');
    const [proofImage, setProofImage] = useState(null);
    const [todayEarnings, setTodayEarnings] = useState(0);
    
    const watchIdRef = useRef(null);
    const token = localStorage.getItem('token');

    const fetchDeliveries = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/order/list`, { headers: { token } });
            if (response.data.success) {
                const allOrders = response.data.data;
                const active = allOrders.filter(o => 
                    ['Driver Assigned', 'Driver Accepted', 'Picked Up', 'On The Way', 'Nearby'].includes(o.deliveryStatus)
                );
                setDeliveries(active);

                setStats({
                    pending: active.filter(o => o.deliveryStatus === 'Driver Assigned').length,
                    accepted: active.filter(o => o.deliveryStatus !== 'Driver Assigned').length,
                    completed: allOrders.filter(o => o.deliveryStatus === 'Delivered' || o.deliveryStatus === 'Completed').length,
                    cancelled: allOrders.filter(o => o.deliveryStatus === 'Cancelled').length,
                    rating: 5.0
                });
            }
        } catch (error) {
            console.error("Error fetching deliveries", error);
        }
    }, [url, token]);

    const toggleStatus = async () => {
        const newStatus = status === 'OFFLINE' ? 'ONLINE' : 'OFFLINE';
        try {
            const response = await axios.post(`${url}/api/delivery/status`, { status: newStatus }, { headers: { token } });
            if (response.data.success) {
                setStatus(newStatus);
                toast.success(`You are now ${newStatus}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    useEffect(() => {
        fetchDeliveries();
        const socket = getAdminSocket();

        socket.on("delivery:assigned", () => {
            toast.info("New Delivery Assigned!");
            fetchDeliveries();
        });
        socket.on("order:updated", fetchDeliveries);

        return () => {
            socket.off("delivery:assigned");
            socket.off("order:updated");
        };
    }, [fetchDeliveries]);

    // Live Tracking Loop
    useEffect(() => {
        // Start watching location if driver has active accepted orders
        const activeDelivery = deliveries.find(o => ['Driver Accepted', 'Picked Up', 'On The Way', 'Nearby'].includes(o.deliveryStatus));
        
        if (activeDelivery && navigator.geolocation) {
            if (!watchIdRef.current) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        const pos = { lat: latitude, lng: longitude };
                        setCurrentLocation(pos);

                        // Broadcast to server
                        const socket = getAdminSocket();
                        socket.emit('driver_location_updated', {
                            orderId: activeDelivery._id,
                            location: pos,
                            eta: etaData.duration,
                            distance: etaData.distance
                        });

                        // Calculate Route to Customer if we have their lat/lng
                        if (activeDelivery.address.lat && activeDelivery.address.lng && window.google) {
                            const directionsService = new window.google.maps.DirectionsService();
                            directionsService.route(
                                {
                                    origin: pos,
                                    destination: { lat: parseFloat(activeDelivery.address.lat), lng: parseFloat(activeDelivery.address.lng) },
                                    travelMode: window.google.maps.TravelMode.DRIVING,
                                },
                                (result, status) => {
                                    if (status === window.google.maps.DirectionsStatus.OK) {
                                        setDirections(result);
                                        const leg = result.routes[0].legs[0];
                                        setEtaData({ distance: leg.distance.text, duration: leg.duration.text });
                                        
                                        // Update ETA on server for Customer/Owner view
                                        socket.emit('eta_updated', {
                                            orderId: activeDelivery._id,
                                            estimatedArrival: leg.duration.text,
                                            remainingDistance: leg.distance.text
                                        });
                                    }
                                }
                            );
                        }
                    },
                    (error) => console.error("Geolocation error", error),
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            }
        } else {
            // Stop watching if no active delivery
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        }

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [deliveries, etaData]);

    const handleAccept = async (orderId) => {
        try {
            const response = await axios.post(`${url}/api/delivery/accept`, { orderId }, { headers: { token } });
            if (response.data.success) setStatus('BUSY');
            fetchDeliveries();
        } catch (error) { toast.error("Error accepting"); }
    };

    const handleReject = async (orderId) => {
        try {
            await axios.post(`${url}/api/delivery/reject`, { orderId }, { headers: { token } });
            fetchDeliveries();
        } catch (error) { toast.error("Error rejecting"); }
    };

    const updateDeliveryStatus = async (orderId, newStatus) => {
        try {
            const response = await axios.post(`${url}/api/order/status`, { orderid: orderId, status: newStatus }, { headers: { token } });
            if (response.data.success) {
                fetchDeliveries();
                const socket = getAdminSocket();
                if (newStatus === 'On The Way') socket.emit('delivery_started', { orderId });
                if (newStatus === 'Nearby') socket.emit('delivery_nearby', { orderId });
                toast.success(`Status updated to: ${newStatus}`);
            }
        } catch (error) { toast.error("Error updating status"); }
    };

    const handleVerifyOTP = async () => {
        try {
            const response = await axios.post(`${url}/api/delivery/verify-otp`, { orderId: activeOrderId, otp: otpInput }, { headers: { token } });
            if (response.data.success) {
                toast.success("OTP Verified! Please upload proof.");
                setShowOTPModal(false);
                setOtpInput('');
                setShowProofModal(true);
            } else {
                toast.error(response.data.message || "Invalid OTP");
            }
        } catch (error) { toast.error("Error verifying OTP"); }
    };

    const handleCompleteDelivery = async () => {
        try {
            const response = await axios.post(`${url}/api/delivery/complete`, { orderId: activeOrderId, proofImage }, { headers: { token } });
            if (response.data.success) {
                toast.success("Delivery Completed!");
                setShowProofModal(false);
                setProofImage(null);
                setTodayEarnings(prev => prev + 4.0); // Assuming flat $4 for now
                fetchDeliveries();
                setStatus('ONLINE');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) { toast.error("Error completing delivery"); }
    };

    return (
        <div className="delivery-dashboard">
            <div className="dashboard-header">
                <div className="welcome-card">
                    <h2>Live Dashboard</h2>
                    <p>Drive safe and deliver smiles!</p>
                </div>
                <div className="status-control">
                    <h3>Current Status: <span className={`status-text ${status.toLowerCase()}`}>{status}</span></h3>
                    {status !== 'BUSY' && (
                        <button className={`status-toggle ${status.toLowerCase()}`} onClick={toggleStatus}>
                            {status === 'ONLINE' ? 'Go Offline' : 'Go Online'}
                        </button>
                    )}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><h3>{stats.pending}</h3><p>Pending</p></div>
                <div className="stat-card"><h3>{stats.accepted}</h3><p>Active</p></div>
                <div className="stat-card"><h3>{stats.completed}</h3><p>Completed</p></div>
                <div className="stat-card"><h3>${todayEarnings.toFixed(2)}</h3><p>Today's Earnings</p></div>
            </div>

            <div className="deliveries-grid">
                {deliveries.length === 0 ? (
                    <div className="empty-state">
                        <p>No active deliveries right now.</p>
                        {status === 'OFFLINE' && <p>Go ONLINE to receive orders!</p>}
                    </div>
                ) : (
                    deliveries.map((order) => {
                        const isActiveMap = ['Driver Accepted', 'Picked Up', 'On The Way', 'Nearby'].includes(order.deliveryStatus);
                        return (
                        <div key={order._id} className="delivery-card">
                            <div className="card-header">
                                <h3>Order #{order._id.substring(order._id.length - 4).toUpperCase()}</h3>
                                <span className="status-badge">{order.deliveryStatus}</span>
                            </div>
                            
                            {isActiveMap && isLoaded && (
                                <div className="map-container">
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={currentLocation || defaultCenter}
                                        zoom={14}
                                        options={{ disableDefaultUI: true }}
                                    >
                                        {currentLocation && <Marker position={currentLocation} icon={{ url: "https://cdn-icons-png.flaticon.com/512/3206/3206015.png", scaledSize: new window.google.maps.Size(40, 40) }} />}
                                        {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
                                        {order.address.lat && <Marker position={{ lat: parseFloat(order.address.lat), lng: parseFloat(order.address.lng) }} />}
                                    </GoogleMap>
                                    <div className="eta-panel">
                                        <p><strong>ETA:</strong> {etaData.duration || 'Calculating...'}</p>
                                        <p><strong>Distance:</strong> {etaData.distance || 'Calculating...'}</p>
                                    </div>
                                </div>
                            )}

                            <div className="customer-info">
                                <p><strong>To:</strong> {order.address.firstname} {order.address.lastname} ({order.address.phone})</p>
                                <p><strong>Address:</strong> {order.address.street}, {order.address.city}</p>
                            </div>

                            <div className="action-buttons">
                                {order.deliveryStatus === 'Driver Assigned' && (
                                    <div className="btn-group">
                                        <button className="btn-accept" onClick={() => handleAccept(order._id)}>Accept</button>
                                        <button className="btn-reject" onClick={() => handleReject(order._id)}>Reject</button>
                                    </div>
                                )}
                                {order.deliveryStatus === 'Driver Accepted' && (
                                    <button className="btn-full" onClick={() => updateDeliveryStatus(order._id, 'Picked Up')}>Mark Picked Up</button>
                                )}
                                {order.deliveryStatus === 'Picked Up' && (
                                    <button className="btn-full" onClick={() => updateDeliveryStatus(order._id, 'On The Way')}>Start Delivery</button>
                                )}
                                {order.deliveryStatus === 'On The Way' && (
                                    <button className="btn-full nearby" onClick={() => updateDeliveryStatus(order._id, 'Nearby')}>I'm Nearby</button>
                                )}
                                {order.deliveryStatus === 'Nearby' && (
                                    <button className="btn-full deliver" onClick={() => { setActiveOrderId(order._id); setShowOTPModal(true); }}>Verify Delivery OTP</button>
                                )}
                            </div>
                        </div>
                    )})
                )}
            </div>

            {/* OTP Modal */}
            {showOTPModal && (
                <div className="modal-overlay">
                    <div className="otp-modal">
                        <h3>Customer OTP</h3>
                        <p>Ask the customer for their 4-digit PIN</p>
                        <input 
                            type="text" 
                            maxLength="4" 
                            className="otp-input"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="0000"
                        />
                        <div className="modal-btns">
                            <button className="btn-cancel" onClick={() => setShowOTPModal(false)}>Cancel</button>
                            <button className="btn-verify" onClick={handleVerifyOTP} disabled={otpInput.length !== 4}>Verify</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof of Delivery Modal */}
            {showProofModal && (
                <div className="modal-overlay">
                    <div className="proof-modal">
                        <h3>Proof of Delivery</h3>
                        <p>Upload a photo or get a signature</p>
                        
                        <div className="proof-upload-area">
                            <input type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setProofImage(reader.result);
                                    reader.readAsDataURL(file);
                                }
                            }} />
                            {proofImage && <img src={proofImage} alt="Proof" className="proof-preview" />}
                        </div>

                        <div className="modal-btns">
                            <button className="btn-verify" onClick={handleCompleteDelivery} disabled={!proofImage}>Complete Delivery</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryDashboard;
