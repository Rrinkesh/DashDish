import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import './Tables.css'; // We will create this

const Tables = ({ url }) => {
    const [tables, setTables] = useState([]);
    const [tableNumber, setTableNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const token = localStorage.getItem('token');

    const fetchTables = async () => {
        try {
            const response = await axios.get(`${url}/api/table/list`, {
                headers: { token }
            });
            if (response.data.success) {
                setTables(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching tables:", error);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const addTable = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/table/add`, {
                tableNumber, capacity
            }, { headers: { token } });
            if (response.data.success) {
                setTableNumber('');
                setCapacity('');
                fetchTables();
            } else {
                alert("Failed to add table");
            }
        } catch (error) {
            console.error("Error adding table", error);
        }
    };

    const removeTable = async (tableId) => {
        try {
            const response = await axios.post(`${url}/api/table/remove`, { tableId }, { headers: { token } });
            if (response.data.success) {
                fetchTables();
            }
        } catch (error) {
            console.error("Error removing table", error);
        }
    };

    return (
        <div className="tables-management">
            <h2>Tables Management</h2>
            
            <form onSubmit={addTable} className="add-table-form">
                <input 
                    type="number" 
                    placeholder="Table Number" 
                    value={tableNumber} 
                    onChange={(e) => setTableNumber(e.target.value)} 
                    required 
                />
                <input 
                    type="number" 
                    placeholder="Capacity (e.g. 4)" 
                    value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} 
                    required 
                />
                <button type="submit" className="add-btn">Add Table</button>
            </form>

            <div className="tables-grid">
                {tables.map(table => (
                    <div key={table._id} className="table-card">
                        <div className="table-header">
                            <h3>Table {table.tableNumber}</h3>
                            <span className={`status-badge ${table.status.toLowerCase()}`}>{table.status}</span>
                        </div>
                        <p>Capacity: {table.capacity} people</p>
                        <div className="qr-container">
                            <QRCodeSVG value={table.qrCodeData} size={100} />
                            <p className="qr-hint">Scan to order</p>
                        </div>
                        <button onClick={() => removeTable(table._id)} className="remove-btn">Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tables;
