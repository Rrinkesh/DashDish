import React, { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios';
import { toast } from 'react-toastify';

const List = () => {

  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [list, setList] = useState([]);


  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);

      console.log(response.data);

      if (response.data.success) {
        setList(response.data.data);
      } 
      else {
        toast.error("Error fetching food list");
      }

    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  }



  const removeFood = async (foodid) => {

    try {

      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodid },
        { headers: { token } }
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
      toast.error("Failed to remove food");
    }

  }



  useEffect(() => {
    fetchList();
  }, []);



  return (

    <div className='list add flex-col'>

      <div className="list-header">
        <h2>All Food List</h2>
        <p>Manage your food items from here</p>
      </div>


      <div className='list-table'>


        <div className="list-table-format title">

          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>

        </div>



        {
          list.map((item,index)=>(

            <div 
              key={index} 
              className='list-table-format'
            >


              <img 
                src={`${url}/images/${item.image}`} 
                alt={item.name}
              />



              <p className="food-name">
                {item.name}
              </p>



              <p className="category">
                {item.category}
              </p>



              <p className="price">
                ₹{item.price}
              </p>



              <button 
                className='delete-btn'
                onClick={()=>removeFood(item._id)}
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


export default List;