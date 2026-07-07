import React, { useEffect, useState } from 'react';
import './Inventory.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const Inventory = ({ url }) => {
  const [inventory, setInventory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ingredientName: '',
    quantityAvailable: '',
    unit: 'pcs',
    minimumThreshold: 10
  });

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${url}/api/inventory/list`);
      if (response.data.success) {
        setInventory(response.data.data);
      } else {
        toast.error("Failed to fetch inventory");
      }
    } catch (error) {
      toast.error("Error fetching inventory");
    }
  };

  useEffect(() => {
    fetchInventory();

    const socket = io(url);
    socket.emit("join_room", "admin");

    socket.on("inventory:low_stock", (items) => {
      items.forEach(item => {
        toast.warning(`Low Stock Alert: ${item.ingredientName} is below threshold!`);
      });
      fetchInventory();
    });
    
    socket.on("food:out_of_stock", (food) => {
      toast.error(`Out of Stock Alert: ${food.name} is now unavailable due to 0 ingredients!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [url]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onAddSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${url}/api/inventory/add`, formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setShowAddForm(false);
        setFormData({ ingredientName: '', quantityAvailable: '', unit: 'pcs', minimumThreshold: 10 });
        fetchInventory();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error adding ingredient");
    }
  };

  const updateStock = async (id, newQuantity) => {
    try {
      const response = await axios.post(`${url}/api/inventory/update`, { id, quantityAvailable: newQuantity });
      if (response.data.success) {
        toast.success("Stock updated");
        fetchInventory();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error updating stock");
    }
  };

  return (
    <div className='inventory'>
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add">
          {showAddForm ? 'Cancel' : 'Add Ingredient'}
        </button>
      </div>

      {showAddForm && (
        <form className='add-ingredient-form flex-col' onSubmit={onAddSubmit}>
          <div className="add-ingredient-name flex-col">
            <p>Ingredient Name</p>
            <input onChange={onChangeHandler} value={formData.ingredientName} type="text" name='ingredientName' placeholder='Type here' required />
          </div>
          <div className="add-ingredient-details flex-row">
            <div className="add-ingredient-qty flex-col">
              <p>Quantity</p>
              <input onChange={onChangeHandler} value={formData.quantityAvailable} type="number" name='quantityAvailable' placeholder='0' required />
            </div>
            <div className="add-ingredient-unit flex-col">
              <p>Unit</p>
              <select onChange={onChangeHandler} name="unit" value={formData.unit}>
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="liters">Liters (l)</option>
                <option value="ml">Milliliters (ml)</option>
              </select>
            </div>
            <div className="add-ingredient-threshold flex-col">
              <p>Min Threshold</p>
              <input onChange={onChangeHandler} value={formData.minimumThreshold} type="number" name='minimumThreshold' placeholder='10' required />
            </div>
          </div>
          <button type='submit' className='add-btn'>ADD INGREDIENT</button>
        </form>
      )}

      <div className="inventory-table">
        <div className="inventory-table-format title">
          <b>Name</b>
          <b>Quantity</b>
          <b>Unit</b>
          <b>Threshold</b>
          <b>Status</b>
          <b>Action</b>
        </div>
        {inventory.map((item, index) => {
          const isLowStock = item.quantityAvailable <= item.minimumThreshold;
          const isOutOfStock = item.quantityAvailable === 0;

          return (
            <div key={index} className="inventory-table-format">
              <p>{item.ingredientName}</p>
              <p>{item.quantityAvailable}</p>
              <p>{item.unit}</p>
              <p>{item.minimumThreshold}</p>
              <p className={`status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
                {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK'}
              </p>
              <div className="actions">
                <button onClick={() => updateStock(item._id, item.quantityAvailable + 10)}>+10</button>
                <button onClick={() => updateStock(item._id, Math.max(0, item.quantityAvailable - 10))}>-10</button>
                <button className="reset-btn" onClick={() => updateStock(item._id, 0)}>Set 0</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Inventory;
