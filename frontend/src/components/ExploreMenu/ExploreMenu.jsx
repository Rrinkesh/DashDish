import React, { useContext } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../context/Store_context';
import { Link } from 'react-router-dom';

const ExploreMenu = () => {
  const { menu_list, url } = useContext(StoreContext);

  return (
    <div className='exploremenu' id='exploremenu'>
      <h1>Explore our Menu</h1>
      <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dignissimos ducimus accusantium commodi cupiditate deleniti debitis!</p>
      <div className="explore-menu-list">
        {menu_list.map((item, ind) => {
          return (
            <Link to={`/category/${item.name}`} key={ind} style={{textDecoration: 'none', color: 'inherit'}} className='explore-menu-list-item'>
              <img src={`${url}/images/${item.image}`} alt="img" width={100} style={{cursor: 'pointer'}} />
              <p>{item.name}</p>
            </Link>
          )
        })}
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu
