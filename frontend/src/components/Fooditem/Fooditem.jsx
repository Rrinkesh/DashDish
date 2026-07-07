import React, { useContext } from 'react'
import './Fooditem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/Store_context';
import { Link } from 'react-router-dom';
import RatingStars from '../RatingStars/RatingStars';

const Fooditem = ({id,name,price,description,image, averageRating = 0, totalRatings = 0}) => {
  const {cartitems,addtocart,removefromcart,url}=useContext(StoreContext);

  return (
    <div>
      <div className="food-item">
<div className="food-item-img-container">
    <Link to={`/food/${id}`} style={{display: 'block'}}>
        <img className='food-item-img' src={url+"/images/"+image} style={{cursor: 'pointer'}} alt="" />
    </Link>
    {!cartitems[id]?<img className='add'  onClick={(e)=>{e.stopPropagation(); e.preventDefault(); addtocart(id)}} src={assets.add}/>
    :<div className='food-item-counter' onClick={(e)=>{e.stopPropagation(); e.preventDefault();}}> 
    <img src={assets.remove} onClick={()=>removefromcart(id)} alt="remove" />
    <p>{cartitems[id]}</p>
    <img onClick={()=>addtocart(id)} src={assets.add}/>
    </div>}
</div>

<Link to={`/food/${id}`} style={{textDecoration: 'none', color: 'inherit'}}>
    <div className="food-item-info" style={{cursor: 'pointer'}}>
        <div className="food-item-name-rating">
        <p>{name}</p>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <RatingStars rating={averageRating} size={16} />
            <span style={{fontSize: '12px', color: '#666'}}>({totalRatings})</span>
        </div>
    </div>
    <p className="food-item-desc">{description}</p>
    <p className="food-item-price">${price}</p>
    </div>
</Link>
      </div>
    </div>
  )
}

export default Fooditem
