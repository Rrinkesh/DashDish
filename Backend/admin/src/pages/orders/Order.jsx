import React, { useEffect, useState } from 'react'
import './Order.css'
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { getAdminSocket } from '../../services/socket';

const Order = ({ url }) => {
  const [allOrders, setAllOrders] = useState([]);
  const [order, setorders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
  });
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    todaysOrders: 0,
    revenue: 0
  });

  const calculateStats = (ordersData, monthFilter) => {
    let pending = 0, preparing = 0, ready = 0, completed = 0, todaysOrders = 0, revenue = 0;
    
    ordersData.forEach(o => {
      // Status counts
      if (o.status === "Pending" || o.status === "food processing...") pending++;
      else if (o.status === "Preparing") preparing++;
      else if (o.status === "Ready") ready++;
      else if (o.status === "Completed") completed++;

      // Month filter logic
      const orderDate = new Date(o.date || Date.now());
      const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (orderMonth === monthFilter) {
        todaysOrders++;
        revenue += o.amount;
      }
    });

    setStats({ pending, preparing, ready, completed, todaysOrders, revenue });
  };

  useEffect(() => {
    if (allOrders.length > 0) {
      const filtered = allOrders.filter(o => {
        const orderDate = new Date(o.date || Date.now());
        const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        return orderMonth === selectedMonth;
      });
      setorders(filtered);
      calculateStats(allOrders, selectedMonth);
    }
  }, [selectedMonth, allOrders]);

  const fetchallorders = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(url + "/api/order/list", { headers: { token } });
    if (response.data.success) {
      setAllOrders(response.data.data);
    } else {
      toast.error("Error fetching orders");
    }
  }

  const statushandler = async (e, orderid) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(url + "/api/order/status", { orderid, status: e.target.value }, { headers: { token } })
    if (response.data.success) {
      await fetchallorders();
    }
  }

  useEffect(() => {
    fetchallorders();

    const socket = getAdminSocket();

    const handleUpdate = () => {
      fetchallorders();
    };

    socket.on("order:new", handleUpdate);
    socket.on("order:updated", handleUpdate);
    socket.on("order:accepted", handleUpdate);
    socket.on("order:preparing", handleUpdate);
    socket.on("order:ready", handleUpdate);
    socket.on("order:completed", handleUpdate);

    return () => {
      socket.off("order:new", handleUpdate);
      socket.off("order:updated", handleUpdate);
      socket.off("order:accepted", handleUpdate);
      socket.off("order:preparing", handleUpdate);
      socket.off("order:ready", handleUpdate);
      socket.off("order:completed", handleUpdate);
    };
  }, [])

  return (
    <div className='order add'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Admin Live Dashboard</h3>
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Month: </label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>
      
      <div className="admin-stats-bar">
        <div className="stat-box"><h4>Pending</h4><p>{stats.pending}</p></div>
        <div className="stat-box"><h4>Preparing</h4><p>{stats.preparing}</p></div>
        <div className="stat-box"><h4>Ready</h4><p>{stats.ready}</p></div>
        <div className="stat-box"><h4>Completed</h4><p>{stats.completed}</p></div>
        <div className="stat-box revenue"><h4>Revenue ({selectedMonth})</h4><p>₹{stats.revenue}</p></div>
      </div>

      <div className="order-list">
        {order.slice().reverse().map((order, index) => (
          <div className='order-item' key={index}>
            <img src={assets.parcel} width={100} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity
                  } else {
                    return item.name + " x " + item.quantity + " , "
                  }
                })}
              </p>
              <p className="order-item-name">{order.address.firstname + " " + order.address.lastname}</p>
              <div className="order-item-address">
                <p>{order.address.street + ","}</p>
                <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + " ," + order.address.zipcode}</p>
              </div>
              <p className='order-item-phone'>{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p className="amount">₹{order.amount}</p>
            <select onChange={(e) => statushandler(e, order._id)} value={order.status}>
              <option value="food processing...">food processing</option>
              <option value="Accepted">Accepted</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="out for delivery">out for delivery</option>
              <option value="delivered">delivered (old)</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Order
