import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import Placeorder from './pages/Placeorder/Placeorder'
import Footer from './components/Footer/Footer'
import Loginpop from './components/Loginpopup/Loginpop'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import Tracking from './pages/Tracking/Tracking'
import Welcome from './pages/Welcome/Welcome'
import FoodDetailsPage from './pages/FoodDetailsPage/FoodDetailsPage'
import CategoryPage from './pages/CategoryPage/CategoryPage'
import MyProfile from './pages/MyProfile/MyProfile'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AIChatWidget from './components/AIChatWidget/AIChatWidget'

const App = () => {
  const [showlogin, setshowlogin] = useState(false);

  return (
    <>
      <ToastContainer />
      {showlogin ? <Loginpop setshowlogin={setshowlogin} /> : null}

      {/* 1. Navbar moved outside .app to span the full screen */}
      <Navbar setshowlogin={setshowlogin} />

      {/* 2. Main content container */}
      <div className='app'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<Placeorder />} />
          <Route path='/Verify' element={<Verify />} />
           <Route path='/myorders' element={<MyOrders />} />
          <Route path='/history' element={<MyOrders />} />
          <Route path='/tracking/:orderId' element={<Tracking />} />
          <Route path='/welcome' element={<Welcome />} />
          <Route path='/food/:id' element={<FoodDetailsPage />} />
          <Route path='/category/:categoryName' element={<CategoryPage />} />
          <Route path='/myprofile' element={<MyProfile />} />
        </Routes>
        <AIChatWidget />
      </div>

      <Footer />
    </>
  )
}

export default App