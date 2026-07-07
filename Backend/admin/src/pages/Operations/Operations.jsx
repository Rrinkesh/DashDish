import React, { useEffect, useState } from 'react';
import './Operations.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const Operations = ({ url }) => {
    const [metrics, setMetrics] = useState({ totalInventoryValue: 0, lowStockCount: 0, outOfStockCount: 0, totalWasteCost: 0, inventoryCount: 0 });
    const [insights, setInsights] = useState({ mostUsedIngredients: [], bottleneckCount: 0, peakLoadLast24h: [] });
    const [optimization, setOptimization] = useState({ promote: [], hide: [] });
    const [wasteHistory, setWasteHistory] = useState([]);
    const [inventory, setInventory] = useState([]);
    
    // Waste form state
    const [wasteForm, setWasteForm] = useState({ inventoryId: '', quantityWasted: '', reason: 'Spilled/Damaged' });

    const fetchData = async () => {
        try {
            const [metRes, insRes, optRes, wasteRes, invRes] = await Promise.all([
                axios.get(`${url}/api/operations/metrics`),
                axios.get(`${url}/api/operations/insights`),
                axios.get(`${url}/api/operations/optimization`),
                axios.get(`${url}/api/operations/waste/history`),
                axios.get(`${url}/api/inventory/list`) // for dropdown
            ]);

            if (metRes.data.success) setMetrics(metRes.data.data);
            if (insRes.data.success) setInsights(insRes.data.data);
            if (optRes.data.success) setOptimization(optRes.data.data);
            if (wasteRes.data.success) setWasteHistory(wasteRes.data.data);
            if (invRes.data.success) {
                setInventory(invRes.data.data);
                if (invRes.data.data.length > 0 && !wasteForm.inventoryId) {
                    setWasteForm(prev => ({ ...prev, inventoryId: invRes.data.data[0]._id }));
                }
            }
        } catch (error) {
            toast.error("Error fetching operations data");
        }
    };

    useEffect(() => {
        fetchData();

        const socket = io(url);
        socket.emit("join_room", "admin");

        socket.on("inventory:updated", () => fetchData());
        socket.on("waste:logged", () => fetchData());
        socket.on("order:new", () => fetchData()); // Refresh insights
        socket.on("order:updated", () => fetchData());

        return () => {
            socket.disconnect();
        };
    }, [url]);

    const handleWasteSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/operations/waste/log`, wasteForm);
            if (response.data.success) {
                toast.success("Waste logged successfully");
                setWasteForm({ ...wasteForm, quantityWasted: '' });
                fetchData();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error logging waste");
        }
    };

    return (
        <div className='operations'>
            <h2>Operations Dashboard</h2>
            
            <div className="kpi-cards">
                <div className="kpi-card">
                    <h3>Total Value</h3>
                    <p>₹{metrics.totalInventoryValue.toFixed(2)}</p>
                </div>
                <div className="kpi-card waste">
                    <h3>Waste Cost</h3>
                    <p>₹{metrics.totalWasteCost.toFixed(2)}</p>
                </div>
                <div className="kpi-card danger">
                    <h3>Out of Stock</h3>
                    <p>{metrics.outOfStockCount} Items</p>
                </div>
                <div className="kpi-card warning">
                    <h3>Low Stock</h3>
                    <p>{metrics.lowStockCount} Items</p>
                </div>
                <div className="kpi-card">
                    <h3>Bottlenecks</h3>
                    <p>{insights.bottleneckCount} Orders</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Kitchen Insights */}
                <div className="panel insights-panel">
                    <h3>Kitchen Insights</h3>
                    <h4>Most Used Ingredients</h4>
                    <ul className="most-used-list">
                        {insights.mostUsedIngredients.map((item, idx) => (
                            <li key={idx}>
                                <span>{item.ingredientName}</span>
                                <b>{item.totalConsumed} {item.unit}</b>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Menu Optimization */}
                <div className="panel optimization-panel">
                    <h3>Auto Menu Optimization</h3>
                    
                    <div className="opt-section promote">
                        <h4>Promote (High Stock)</h4>
                        <ul>
                            {optimization.promote.length === 0 ? <li>No items to promote</li> : 
                             optimization.promote.map((f, i) => <li key={i}>{f.name}</li>)}
                        </ul>
                    </div>

                    <div className="opt-section hide">
                        <h4>Consider Hiding (Low Stock)</h4>
                        <ul>
                            {optimization.hide.length === 0 ? <li>No items running low</li> : 
                             optimization.hide.map((f, i) => <li key={i}>{f.name}</li>)}
                        </ul>
                    </div>
                </div>

                {/* Waste Tracking */}
                <div className="panel waste-panel">
                    <h3>Waste Tracking</h3>
                    <form onSubmit={handleWasteSubmit} className="waste-form">
                        <select 
                            value={wasteForm.inventoryId} 
                            onChange={(e) => setWasteForm({...wasteForm, inventoryId: e.target.value})}
                            required
                        >
                            <option value="" disabled>Select Ingredient</option>
                            {inventory.map((item, idx) => (
                                <option key={idx} value={item._id}>{item.ingredientName} ({item.unit})</option>
                            ))}
                        </select>
                        <input 
                            type="number" 
                            placeholder="Qty Wasted" 
                            value={wasteForm.quantityWasted}
                            onChange={(e) => setWasteForm({...wasteForm, quantityWasted: e.target.value})}
                            required
                        />
                        <select 
                            value={wasteForm.reason}
                            onChange={(e) => setWasteForm({...wasteForm, reason: e.target.value})}
                        >
                            <option value="Expired">Expired</option>
                            <option value="Spilled/Damaged">Spilled/Damaged</option>
                            <option value="Burned/Overcooked">Burned/Overcooked</option>
                            <option value="Other">Other</option>
                        </select>
                        <button type="submit">Log Waste</button>
                    </form>

                    <h4>Recent Waste Log</h4>
                    <div className="waste-history">
                        {wasteHistory.map((w, idx) => (
                            <div key={idx} className="waste-item">
                                <span><b>{w.ingredientName}</b> - {w.quantityWasted} {w.unit}</span>
                                <span className="waste-reason">{w.reason} (-₹{w.costLost})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Operations;
