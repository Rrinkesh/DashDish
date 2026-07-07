import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAdminSocket } from '../../services/socket';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './LiveTracking.css';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '600px', borderRadius: '10px' };
// Default center, ideally should be the restaurant's location
const defaultCenter = { lat: 40.7128, lng: -74.0060 };

const LiveTracking = ({ url }) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const [activeDeliveries, setActiveDeliveries] = useState({});
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const token = localStorage.getItem('token');

    // Fetch initial active deliveries and their last known locations from DB
    const fetchActiveDeliveries = async () => {
        try {
            const response = await axios.get(`${url}/api/order/list`, { headers: { token } });
            if (response.data.success) {
                const active = response.data.data.filter(o => 
                    ['Picked Up', 'On The Way', 'Nearby'].includes(o.deliveryStatus)
                );
                
                const deliveriesMap = {};
                active.forEach(order => {
                    // Only map if we have a valid location
                    if (order.driverCurrentLocation && order.driverCurrentLocation.lat) {
                        deliveriesMap[order._id] = {
                            orderId: order._id,
                            location: order.driverCurrentLocation,
                            eta: order.estimatedArrival,
                            distance: order.remainingDistance,
                            status: order.deliveryStatus,
                            customer: order.address.firstname
                        };
                    }
                });
                setActiveDeliveries(deliveriesMap);
            }
        } catch (error) {
            console.error("Error fetching active deliveries", error);
        }
    };

    useEffect(() => {
        fetchActiveDeliveries();
        const socket = getAdminSocket();

        const handleLocationUpdate = (data) => {
            setActiveDeliveries(prev => ({
                ...prev,
                [data.orderId]: {
                    ...prev[data.orderId],
                    location: data.location,
                    eta: data.eta,
                    distance: data.distance
                }
            }));
        };

        const handleStatusUpdate = () => {
            fetchActiveDeliveries();
        };

        socket.on("driver_location_updated", handleLocationUpdate);
        socket.on("eta_updated", handleLocationUpdate);
        socket.on("order:updated", handleStatusUpdate);

        return () => {
            socket.off("driver_location_updated", handleLocationUpdate);
            socket.off("eta_updated", handleLocationUpdate);
            socket.off("order:updated", handleStatusUpdate);
        };
    }, []);

    const markers = Object.values(activeDeliveries);

    return (
        <div className="live-tracking">
            <h2>Live Delivery Tracking</h2>
            <div className="tracking-summary">
                <div className="summary-card">
                    <h3>{markers.length}</h3>
                    <p>Active Drivers on Route</p>
                </div>
            </div>

            <div className="map-wrapper">
                {!isLoaded ? (
                    <p>Loading Map...</p>
                ) : (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={defaultCenter}
                        zoom={13}
                    >
                        {markers.map(delivery => (
                            <Marker
                                key={delivery.orderId}
                                position={delivery.location}
                                icon={{
                                    url: "https://cdn-icons-png.flaticon.com/512/3206/3206015.png",
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                                onClick={() => setSelectedDelivery(delivery)}
                            />
                        ))}

                        {selectedDelivery && (
                            <InfoWindow
                                position={selectedDelivery.location}
                                onCloseClick={() => setSelectedDelivery(null)}
                            >
                                <div className="info-window">
                                    <h4>Order #{selectedDelivery.orderId.substring(selectedDelivery.orderId.length - 4).toUpperCase()}</h4>
                                    <p><strong>Customer:</strong> {selectedDelivery.customer}</p>
                                    <p><strong>Status:</strong> {selectedDelivery.status || 'On The Way'}</p>
                                    <p><strong>ETA:</strong> {selectedDelivery.eta || 'Calculating...'}</p>
                                    <p><strong>Distance:</strong> {selectedDelivery.distance || 'Calculating...'}</p>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                )}
            </div>
        </div>
    );
};

export default LiveTracking;
