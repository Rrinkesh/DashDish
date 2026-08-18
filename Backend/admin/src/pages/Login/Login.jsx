import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = ({ url }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await axios.post(
                url + '/api/user/login',
                {
                    email,
                    password
                }
            );


            if(response.data.success){

                if(response.data.role === 'CUSTOMER' && !response.data.isAdmin){

                    toast.error("Customers cannot access the Admin Portal");
                    return;

                }


                localStorage.setItem("token",response.data.token);
                localStorage.setItem("role",response.data.role);


                toast.success("Welcome back!");

                window.location.href='/';

            }
            else{

                toast.error(response.data.message);

            }


        } catch(error){

            console.log(error);

            toast.error("Login failed");

        }

    }



    return (

        <div className="admin-login-container">


            <div className="admin-login-box">


                <div className="login-logo">

                    🍽️

                </div>


                <h2>
                    Admin Portal
                </h2>


                <p>
                    Sign in to manage your restaurant dashboard
                </p>



                <form onSubmit={handleSubmit}>


                    <div className="login-input-group">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            required
                        />

                    </div>




                    <div className="login-input-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                        />

                    </div>




                    <button 
                        type="submit"
                        className="admin-login-btn"
                    >
                        Login
                    </button>



                </form>



            </div>


        </div>

    );
};


export default Login;