import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
    // For demo purposes, fetch role from localStorage, fallback to OWNER if not set
    const role = localStorage.getItem('role') || 'OWNER';

    return (
        <div className='sidebar'>
            <div className="sidebar-options">
                
                {/* OWNER & MANAGER can see Orders */}
                {['SUPER_ADMIN', 'OWNER', 'admin', 'MANAGER'].includes(role) && (
                    <NavLink to='/order' className="sidebar-option">
                        <img src={assets.add} alt="" />
                        <p>Orders Dashboard</p>
                    </NavLink>
                )}

                {/* KITCHEN, OWNER, MANAGER can see Kitchen */}
                {['SUPER_ADMIN', 'OWNER', 'admin', 'MANAGER', 'KITCHEN'].includes(role) && (
                    <NavLink to='/kitchen' className="sidebar-option">
                        <img src={assets.add} alt="" />
                        <p>Kitchen Screen</p>
                    </NavLink>
                )}

                {/* OWNER & MANAGER can manage Menu */}
                {['SUPER_ADMIN', 'OWNER', 'admin', 'MANAGER'].includes(role) && (
                    <>
                        <NavLink to='/add' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Add Item</p>
                        </NavLink>
                        <NavLink to='/list' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>List Items</p>
                        </NavLink>
                        <NavLink to='/add-menu' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Add Category</p>
                        </NavLink>
                        <NavLink to='/list-menu' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>List Categories</p>
                        </NavLink>
                        <NavLink to='/inventory' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Inventory</p>
                        </NavLink>
                        <NavLink to='/operations' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Operations Dashboard</p>
                        </NavLink>
                        <NavLink to='/ai-insights' className="sidebar-option" style={{borderLeft: '3px solid #3498db'}}>
                            <img src={assets.add} alt="" />
                            <p>Business AI Insights</p>
                        </NavLink>
                    </>
                )}

                {/* OWNER & MANAGER can see Tables and Reservations */}
                {['SUPER_ADMIN', 'OWNER', 'admin', 'MANAGER'].includes(role) && (
                    <>
                        <NavLink to='/tables' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Tables Management</p>
                        </NavLink>
                        <NavLink to='/reservations' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Reservations</p>
                        </NavLink>
                    </>
                )}

                {/* OWNER & MANAGER can manage Deliveries */}
                {['SUPER_ADMIN', 'OWNER', 'admin', 'MANAGER'].includes(role) && (
                    <>
                        <NavLink to='/delivery-partners' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Delivery Partners</p>
                        </NavLink>
                        <NavLink to='/delivery-management' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Assign Deliveries</p>
                        </NavLink>
                        <NavLink to='/live-tracking' className="sidebar-option">
                            <img src={assets.order_icon} alt="" />
                            <p>Live Tracking</p>
                        </NavLink>
                    </>
                )}

                {/* DELIVERY role only sees their dashboard */}
                {['DELIVERY'].includes(role) && (
                    <>
                        <NavLink to='/delivery-dashboard' className="sidebar-option">
                            <img src={assets.order_icon} alt="" />
                            <p>Delivery Dashboard</p>
                        </NavLink>
                        <NavLink to='/delivery-history' className="sidebar-option">
                            <img src={assets.order_icon} alt="" />
                            <p>Delivery History</p>
                        </NavLink>
                    </>
                )}

                {/* OWNER & MANAGER can manage Coupons */}
                {['SUPER_ADMIN', 'OWNER', 'admin', 'MANAGER'].includes(role) && (
                    <>
                        <NavLink to='/coupons' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Coupons</p>
                        </NavLink>
                    </>
                )}

                {/* OWNER can manage Staff, Settings, Finance, Refunds */}
                {['SUPER_ADMIN', 'OWNER', 'admin'].includes(role) && (
                    <>
                        <NavLink to='/finance' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Finance Dashboard</p>
                        </NavLink>
                        <NavLink to='/refunds' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Refunds</p>
                        </NavLink>
                        <NavLink to='/staff' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Staff Management</p>
                        </NavLink>
                        <NavLink to='/settings' className="sidebar-option">
                            <img src={assets.add} alt="" />
                            <p>Restaurant Settings</p>
                        </NavLink>
                    </>
                )}

            </div>
        </div>
    )
}

export default Sidebar
