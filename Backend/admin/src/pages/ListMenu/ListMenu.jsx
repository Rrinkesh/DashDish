import React, { useEffect, useState } from 'react'
import '../List/List.css'
import axios from 'axios';
import { toast } from 'react-toastify';


const ListMenu = () => {

  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [list, setList] = useState([]);



  const fetchList = async () => {

    try {

      const response = await axios.get(`${url}/api/menu/list`);

      if(response.data.success){

        setList(response.data.data);

      }
      else{

        toast.error("Error fetching menus");

      }

    } catch(error){

      console.log(error);
      toast.error("Something went wrong");

    }

  }



  const removeMenu = async(menuid) => {

    try {

      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${url}/api/menu/remove`,
        {id: menuid},
        {
          headers:{
            token
          }
        }
      );


      if(response.data.success){

        toast.success(response.data.message);
        await fetchList();

      }
      else{

        toast.error(response.data.message);

      }


    } catch(error){

      console.log(error);
      toast.error("Failed to remove menu");

    }

  }



  useEffect(()=>{

    fetchList();

  },[]);



  return (

    <div className='list add flex-col'>


      <div className="list-header">

        <h2>
          All Menu Categories
        </h2>

        <p>
          Manage your menu categories from here
        </p>

      </div>



      <div className='list-table'>


        <div 
          className="list-table-format title"
          style={{
            gridTemplateColumns:"1fr 2fr 1fr"
          }}
        >

          <b>Image</b>
          <b>Name</b>
          <b>Action</b>

        </div>




        {
          list.map((item,index)=>(

            <div 
              key={index}
              className='list-table-format'
              style={{
                gridTemplateColumns:"1fr 2fr 1fr"
              }}
            >


              <img 
                src={`${url}/images/${item.image}`} 
                alt={item.name}
              />



              <p className="food-name">
                {item.name}
              </p>



              <button
                className="delete-btn"
                onClick={()=>removeMenu(item._id)}
              >
                Delete
              </button>



            </div>

          ))
        }



      </div>


    </div>

  )

}


export default ListMenu;