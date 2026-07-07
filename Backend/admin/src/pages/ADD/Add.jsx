import React, {  useEffect, useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from "axios";
import { toast } from 'react-toastify';

const Add = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [img,setimg]=useState(null);
  const [menuList, setMenuList] = useState([]);
  const [data,setdata]=useState({
    name:"",
    description:"",
    price:"",
    category:""
  });

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${url}/api/menu/list`);
        if (response.data.success) {
          setMenuList(response.data.data);
          if (response.data.data.length > 0) {
            setdata(prev => ({ ...prev, category: response.data.data[0].name }));
          }
        }
      } catch (error) {
        console.log("Error fetching menu list", error);
      }
    };
    fetchMenu();
  }, []);

  const onChangehandler=(event)=>{
    const name=event.target.name;
    const value =event.target.value;
    setdata(data=>({...data,[name]:value}))
  }

  const onSubmithandler= async(e)=>{
      e.preventDefault();
      
      if (!data.category || data.category === "None") {
        toast.error("Please add a menu category first!");
        return;
      }

      const formData=new FormData();
      formData.append("name",data.name)
      formData.append("description",data.description)
      formData.append("price",data.price)
      formData.append("category",data.category)
      formData.append("image",img)

      const token = localStorage.getItem('token');
      const response = await axios.post(`${url}/api/food/add`,formData, {
        headers: { token }
      })
      if(response.data.success){
        setdata({
          name:"",
          description:"",
          price:"",
          category: menuList.length > 0 ? menuList[0].name : ""
        })
        setimg(false);
        toast.success(response.data.message)
      }
      else{
        toast.error(response.data.message)
      }
      
  }

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmithandler}>
        <div className="add-image-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={img?URL.createObjectURL(img):assets.upload} alt="" />
          </label>
          <input onChange={(e)=>setimg(e.target.files[0])} type="file" id='image' hidden required />
        </div>
        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input onChange={onChangehandler} value={data.name} type="text" name='name' placeholder='type here' required />
        </div>
        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea onChange={onChangehandler} value={data.description} name="description" rows="6" placeholder='write content here' required></textarea>
        </div>
        <div className='add-category-price'>
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangehandler} name="category" value={data.category}>
              {menuList.length > 0 ? (
                menuList.map((item, index) => (
                  <option key={index} value={item.name}>{item.name}</option>
                ))
              ) : (
                <option value="None">No categories available</option>
              )}
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product price</p>
            <input onChange={onChangehandler} value={data.price} type="Number" name='price' placeholder='$20' required />
          </div>
        </div>
        <button type='Submit' className='add-button'>ADD</button>
      </form>
    </div>
  )
}

export default Add
