import React, { useState } from 'react'
import '../AddMenu/Add.css'
import { assets } from '../../assets/assets'
import axios from "axios";
import { toast } from 'react-toastify';

const AddMenu = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [img,setimg]=useState(null);
  const [data,setdata]=useState({
    name:""
  });

  const onChangehandler=(event)=>{
    const name=event.target.name;
    const value =event.target.value;
    setdata(data=>({...data,[name]:value}))
  }

  const onSubmithandler= async(e)=>{
      e.preventDefault();
      const formData=new FormData();
      formData.append("name",data.name)
      formData.append("image",img)

       const token = localStorage.getItem('token');
       const response = await axios.post(`${url}/api/menu/add`,formData, { headers: { token } })
      if(response.data.success){
        setdata({
          name:""
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
          <p>Upload Category Image</p>
          <label htmlFor="image">
            <img src={img?URL.createObjectURL(img):assets.upload} alt="" />
          </label>
          <input onChange={(e)=>setimg(e.target.files[0])} type="file" id='image' hidden required />
        </div>
        <div className="add-product-name flex-col">
          <p>Category name</p>
          <input onChange={onChangehandler} value={data.name} type="text" name='name' placeholder='e.g., Salad' required />
        </div>
        <button type='Submit' className='add-button'>ADD MENU CATEGORY</button>
      </form>
    </div>
  )
}

export default AddMenu
