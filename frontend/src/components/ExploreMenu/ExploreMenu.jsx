import React, { useContext } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../context/Store_context';
import { Link } from 'react-router-dom';

const ExploreMenu = () => {
  const { menu_list, url } = useContext(StoreContext);

  return (
    <div className='exploremenu' id='exploremenu'>
      <h1>Explore our Menu</h1>
      <p className='explore-menu-text'>
    Discover delicious dishes made with fresh ingredients,
    from comforting classics to exciting new flavours.
    Find something you'll love and order it in just a few clicks.
</p>
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
