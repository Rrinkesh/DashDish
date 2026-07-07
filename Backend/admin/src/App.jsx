import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import List from './pages/List/List'
import Add from './pages/ADD/Add'
import Order from './pages/orders/Order'
import AddMenu from './pages/AddMenu/AddMenu'
import ListMenu from './pages/ListMenu/ListMenu'
import Kitchen from './pages/KitchenDashboard/Kitchen'
import Staff from './pages/Staff/Staff'
import Settings from './pages/Settings/Settings'
import Tables from './pages/Tables/Tables'
import DeliveryDashboard from './pages/DeliveryDashboard/DeliveryDashboard'
import DeliveryManagement from './pages/DeliveryManagement/DeliveryManagement'
import DeliveryPartners from './pages/DeliveryPartners/DeliveryPartners'
import DeliveryHistory from './pages/DeliveryHistory/DeliveryHistory'
import LiveTracking from './pages/LiveTracking/LiveTracking'
import Login from './pages/Login/Login'
import Coupons from './pages/Coupons/Coupons'
import FinanceDashboard from './pages/Finance/FinanceDashboard'
import Refunds from './pages/Finance/Refunds'
import Inventory from './pages/Inventory/Inventory'
import Operations from './pages/Operations/Operations'
import AIInsights from './pages/AIInsights/AIInsights'
import { ToastContainer} from 'react-toastify';

const App = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div>
        <ToastContainer />
        <Routes>
          <Route path="*" element={<Login url={url} />} />
        </Routes>
      </div>
    )
  }

  return (
    <div>
        <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content" >
        <Sidebar />
        <Routes>
        <Route path='/add' element={<Add url={url} />}  />
        <Route path='/list' element={<List url={url} />}  />
        <Route path='/order' element={<Order url={url} />}  />
        <Route path='/kitchen' element={<Kitchen url={url} />}  />
        <Route path='/add-menu' element={<AddMenu url={url} />} />
        <Route path='/list-menu' element={<ListMenu url={url} />} />
        <Route path='/staff' element={<Staff url={url} />} />
        <Route path='/settings' element={<Settings url={url} />} />
        <Route path='/tables' element={<Tables url={url} />} />
        <Route path='/delivery-partners' element={<DeliveryPartners url={url} />} />
        <Route path='/live-tracking' element={<LiveTracking url={url} />} />
        <Route path='/delivery-dashboard' element={<DeliveryDashboard url={url} />} />
        <Route path='/delivery-history' element={<DeliveryHistory url={url} />} />
        <Route path='/delivery-management' element={<DeliveryManagement url={url} />} />
        <Route path='/coupons' element={<Coupons url={url} />} />
        <Route path='/finance' element={<FinanceDashboard url={url} />} />
        <Route path='/refunds' element={<Refunds url={url} />} />
        <Route path='/inventory' element={<Inventory url={url} />} />
        <Route path='/operations' element={<Operations url={url} />} />
        <Route path='/ai-insights' element={<AIInsights url={url} />} />
        <Route path='*' element={
            localStorage.getItem('role') === 'KITCHEN' ? <Navigate to="/kitchen" /> :
            localStorage.getItem('role') === 'DELIVERY' ? <Navigate to="/delivery-dashboard" /> :
            <Navigate to="/order" />
        } />
        </Routes>
      
      </div>
    </div>
  )
}

export default App
