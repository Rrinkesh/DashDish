import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'

import {
    ShoppingBag,
    ChefHat,
    PlusCircle,
    UtensilsCrossed,
    FolderPlus,
    FolderOpen,
    Package,
    Settings2,
    Bot,
    Armchair,
    CalendarDays,
    Bike,
    ClipboardList,
    MapPin,
    Ticket,
    Wallet,
    RotateCcw,
    Users,
    Settings,
    BarChart3,
    LayoutDashboard
} from 'lucide-react'


const Sidebar = () => {

    const role = localStorage.getItem('role') || 'OWNER'


    const managementRoles = [
        'SUPER_ADMIN',
        'OWNER',
        'admin',
        'MANAGER'
    ]


    const ownerRoles = [
        'SUPER_ADMIN',
        'OWNER',
        'admin'
    ]


    const isManagement =
        managementRoles.includes(role)

    const isOwner =
        ownerRoles.includes(role)


    return (

        <aside className="sidebar">

            <div className="sidebar-options">


                {/* =================================
                    OVERVIEW
                ================================= */}

                <div className="sidebar-section">

                    <p className="sidebar-section-title">
                        OVERVIEW
                    </p>


                    <NavLink
                        to="/"
                        className="sidebar-option"
                    >
                        <LayoutDashboard />
                        <p>Dashboard</p>
                    </NavLink>

                </div>


                {/* =================================
                    ORDERS
                ================================= */}

                {isManagement && (

                    <div className="sidebar-section">

                        <p className="sidebar-section-title">
                            ORDERS
                        </p>


                        <NavLink
                            to="/order"
                            className="sidebar-option"
                        >
                            <ShoppingBag />
                            <p>Orders Dashboard</p>
                        </NavLink>


                        <NavLink
                            to="/kitchen"
                            className="sidebar-option"
                        >
                            <ChefHat />
                            <p>Kitchen Screen</p>
                        </NavLink>

                    </div>

                )}


                {/* =================================
                    MENU MANAGEMENT
                ================================= */}

                {isManagement && (

                    <div className="sidebar-section">

                        <p className="sidebar-section-title">
                            MENU MANAGEMENT
                        </p>


                        <NavLink
                            to="/add"
                            className="sidebar-option"
                        >
                            <PlusCircle />
                            <p>Add Item</p>
                        </NavLink>


                        <NavLink
                            to="/list"
                            className="sidebar-option"
                        >
                            <UtensilsCrossed />
                            <p>List Items</p>
                        </NavLink>


                        <NavLink
                            to="/add-menu"
                            className="sidebar-option"
                        >
                            <FolderPlus />
                            <p>Add Category</p>
                        </NavLink>


                        <NavLink
                            to="/list-menu"
                            className="sidebar-option"
                        >
                            <FolderOpen />
                            <p>List Categories</p>
                        </NavLink>


                        <NavLink
                            to="/inventory"
                            className="sidebar-option"
                        >
                            <Package />
                            <p>Inventory</p>
                        </NavLink>

                    </div>

                )}


                {/* =================================
                    BUSINESS
                ================================= */}

                {isManagement && (

                    <div className="sidebar-section">

                        <p className="sidebar-section-title">
                            BUSINESS
                        </p>


                        <NavLink
                            to="/operations"
                            className="sidebar-option"
                        >
                            <BarChart3 />
                            <p>Operations Dashboard</p>
                        </NavLink>


                        <NavLink
                            to="/ai-insights"
                            className="sidebar-option ai-option"
                        >
                            <Bot />
                            <p>Business AI Insights</p>

                            <span className="ai-badge">
                                AI
                            </span>

                        </NavLink>


                        <NavLink
                            to="/tables"
                            className="sidebar-option"
                        >
                            <Armchair />
                            <p>Tables Management</p>
                        </NavLink>


                        <NavLink
                            to="/reservations"
                            className="sidebar-option"
                        >
                            <CalendarDays />
                            <p>Reservations</p>
                        </NavLink>

                    </div>

                )}


                {/* =================================
                    DELIVERY
                ================================= */}

                {isManagement && (

                    <div className="sidebar-section">

                        <p className="sidebar-section-title">
                            DELIVERY
                        </p>


                        <NavLink
                            to="/delivery-partners"
                            className="sidebar-option"
                        >
                            <Bike />
                            <p>Delivery Partners</p>
                        </NavLink>


                        <NavLink
                            to="/delivery-management"
                            className="sidebar-option"
                        >
                            <ClipboardList />
                            <p>Assign Deliveries</p>
                        </NavLink>


                        <NavLink
                            to="/live-tracking"
                            className="sidebar-option"
                        >
                            <MapPin />
                            <p>Live Tracking</p>
                        </NavLink>

                    </div>

                )}


                {/* =================================
                    DELIVERY STAFF
                ================================= */}

                {role === 'DELIVERY' && (

                    <div className="sidebar-section">

                        <p className="sidebar-section-title">
                            MY DELIVERY
                        </p>


                        <NavLink
                            to="/delivery-dashboard"
                            className="sidebar-option"
                        >
                            <Bike />
                            <p>Delivery Dashboard</p>
                        </NavLink>


                        <NavLink
                            to="/delivery-history"
                            className="sidebar-option"
                        >
                            <ClipboardList />
                            <p>Delivery History</p>
                        </NavLink>

                    </div>

                )}


                {/* =================================
                    PROMOTIONS
                ================================= */}

                {isManagement && (

                    <div className="sidebar-section">

                        <p className="sidebar-section-title">
                            PROMOTIONS
                        </p>


                        <NavLink
                            to="/coupons"
                            className="sidebar-option"
                        >
                            <Ticket />
                            <p>Coupons</p>
                        </NavLink>

                    </div>

                )}


                {/* =================================
                    ADMINISTRATION
                ================================= */}

                {isOwner && (

                    <div className="sidebar-section">

                        <p className="sidebar-section-title">
                            ADMINISTRATION
                        </p>


                        <NavLink
                            to="/finance"
                            className="sidebar-option"
                        >
                            <Wallet />
                            <p>Finance Dashboard</p>
                        </NavLink>


                        <NavLink
                            to="/refunds"
                            className="sidebar-option"
                        >
                            <RotateCcw />
                            <p>Refunds</p>
                        </NavLink>


                        <NavLink
                            to="/staff"
                            className="sidebar-option"
                        >
                            <Users />
                            <p>Staff Management</p>
                        </NavLink>


                        <NavLink
                            to="/settings"
                            className="sidebar-option"
                        >
                            <Settings />
                            <p>Restaurant Settings</p>
                        </NavLink>

                    </div>

                )}

            </div>

        </aside>
    )
}


export default Sidebar