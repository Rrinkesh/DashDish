import React, { useEffect, useState } from 'react'
import '../List/List.css'
import axios from 'axios';
import { toast } from 'react-toastify';
const ListMenu = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [list,setlist] =useState([]);
    const fetchList =async ()=>{
      const response =await axios.get(`${url}/api/menu/list`);
      if(response.data.success){
        setlist(response.data.data);
      }
      else{
        toast.error("Error fetching menus");
      }
    }
    const removeMenu=async(menuid)=>{
          const token = localStorage.getItem('token');
          const response =await axios.post(`${url}/api/menu/remove`,{id:menuid}, { headers: { token } });
          await fetchList();
          if(response.data.success){
            toast.success(response.data.message);
          }
    }
    useEffect(()=>{fetchList()

    }
    ,[])
  return (
    
    <div className='list add flex-col'>
      <p>All Menu Categories</p>
      <div className='list-table'>
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Action</b>
        </div>
        {list.map((item,index)=>{
          return(
            <div key={index} className='list-table-format' style={{gridTemplateColumns: "1fr 2fr 1fr"}}>
              <img src={`${url}/images/${item.image}`}  alt="" />
              <p>{item.name}</p>
              <p className='cursor' onClick={()=>removeMenu(item._id)}>X</p>
            </div>
          )
        })}
      </div>
    
    </div>
  )
}
export default ListMenu
