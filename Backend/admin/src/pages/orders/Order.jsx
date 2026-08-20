import React, { useEffect, useState } from 'react'
import './Order.css'
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { getAdminSocket } from '../../services/socket';

const Order = ({ url }) => {
  const [allOrders, setAllOrders] = useState([]);
  const [order, setorders] = useState([]);
  const [filter, setFilter] = useState('Active'); // 'Active' (default), 'Pending', 'Preparing', 'Ready', 'Completed'
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

  const getFilteredOrders = () => {
    return order.filter(o => {
      if (filter === 'Active') {
        return o.status !== 'Completed' && o.status !== 'Cancelled';
      }
      if (filter === 'Pending') {
        return o.status === 'Pending' || o.status === 'food processing...';
      }
      if (filter === 'Preparing') {
        return o.status === 'Preparing';
      }
      if (filter === 'Ready') {
        return o.status === 'Ready';
      }
      if (filter === 'Completed') {
        return o.status === 'Completed';
      }
      return true;
    });
  };

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
        <div 
          className={`stat-box ${filter === 'Pending' ? 'active-filter' : ''}`}
          onClick={() => setFilter(prev => prev === 'Pending' ? 'Active' : 'Pending')}
          style={{ cursor: 'pointer' }}
        >
          <h4>Pending</h4>
          <p>{stats.pending}</p>
        </div>
        <div 
          className={`stat-box ${filter === 'Preparing' ? 'active-filter' : ''}`}
          onClick={() => setFilter(prev => prev === 'Preparing' ? 'Active' : 'Preparing')}
          style={{ cursor: 'pointer' }}
        >
          <h4>Preparing</h4>
          <p>{stats.preparing}</p>
        </div>
        <div 
          className={`stat-box ${filter === 'Ready' ? 'active-filter' : ''}`}
          onClick={() => setFilter(prev => prev === 'Ready' ? 'Active' : 'Ready')}
          style={{ cursor: 'pointer' }}
        >
          <h4>Ready</h4>
          <p>{stats.ready}</p>
        </div>
        <div 
          className={`stat-box ${filter === 'Completed' ? 'active-filter' : ''}`}
          onClick={() => setFilter(prev => prev === 'Completed' ? 'Active' : 'Completed')}
          style={{ cursor: 'pointer' }}
        >
          <h4>Completed</h4>
          <p>{stats.completed}</p>
        </div>
        <div className="stat-box revenue">
          <h4>Revenue ({selectedMonth})</h4>
          <p>₹{stats.revenue}</p>
        </div>
      </div>

      <div className="filter-controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', background: 'white', padding: '15px 20px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', color: '#64748b', fontSize: '14px' }}>Filter:</span>
          {['Active', 'Pending', 'Preparing', 'Ready'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontWeight: 'bold',
                fontSize: '14px',
                background: filter === type ? '#6366f1' : 'white',
                color: filter === type ? 'white' : '#475569',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              {type === 'Active' ? 'All Active' : type}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setFilter(prev => prev === 'Completed' ? 'Active' : 'Completed')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontWeight: 'bold',
            fontSize: '14px',
            background: filter === 'Completed' ? '#16a34a' : 'white',
            color: filter === 'Completed' ? 'white' : '#16a34a',
            borderColor: '#16a34a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s',
            boxShadow: filter === 'Completed' ? '0 4px 12px rgba(22, 163, 74, 0.2)' : 'none'
          }}
        >
          📜 {filter === 'Completed' ? 'Showing History' : 'Order History'}
        </button>
      </div>

      <div className="order-list">
        {getFilteredOrders().slice().reverse().map((order, index) => (
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
