import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import RecommendedForYou from '../../components/RecommendedForYou/RecommendedForYou'

const Home = () => {
  return (
    <div>
      <Header />
      <RecommendedForYou />
      <ExploreMenu />
      <FoodDisplay category="all" topRated={true} />
    </div>
  )
}

export default Home
