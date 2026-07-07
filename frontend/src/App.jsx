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
  const  [showlogin,setshowlogin] =useState(false);
  return (
    <>
    <ToastContainer />
    {showlogin?<Loginpop setshowlogin={setshowlogin} />:<></>}
    <div className='app'>
      <Navbar setshowlogin={setshowlogin} />
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/cart' element={<Cart />}></Route>
        <Route path='/order' element={<Placeorder />}></Route>
        <Route path='/Verify' element={<Verify />}></Route> 
        <Route path='/myorders' element ={<MyOrders />} ></Route>
        <Route path='/tracking/:orderId' element={<Tracking />} />
        <Route path='/welcome' element={<Welcome />} ></Route>
        <Route path='/food/:id' element={<FoodDetailsPage />} ></Route>
        <Route path='/category/:categoryName' element={<CategoryPage />} ></Route>
        <Route path='/myprofile' element={<MyProfile />} ></Route>
      </Routes>
      <AIChatWidget />
    </div>
    <Footer/>
    </>
  )
}

export default App
