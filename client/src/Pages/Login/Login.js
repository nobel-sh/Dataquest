import React, { useState,useRef } from "react";
import { LoginContainer, LoginInputContainer } from "./login.styled";
import { useSignIn} from "react-auth-kit";
import axios from 'axios';
import { Link,useNavigate } from "react-router-dom";

export const Login = () => {
    const email = useRef(null);
    const password = useRef(null);
    const SignIn = useSignIn();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            email:email.current.value,
            password:password.current.value,
        }
        const res = await axios.post('http://localhost:4949/api/v1/user/login',data,{
            headers: {
                'Content-Type': 'application/json'
            }
        });
       SignIn({
              token:res.data.accessToken,
              expiresIn:res.data.expiresIn,
              authState:res.data.user,
                tokenType:'Bearer',
       });
       console.log(res.data);
       if(res.status===200){
           navigate('/dashboard/',   { replace: true });
           navigate(0);
        }else{
            alert("Invalid Credentials");

        }

    }
return(
        <LoginContainer> 
                <h1 > Login to your account </h1>
                <LoginInputContainer onSubmit={handleSubmit}>
                        <label>Email</label><input type="email" placeholder="Enter Email" ref={email}/>
                        <label>Password</label><input type="password" placeholder="Enter Password" ref={password}/>
                    <button type="submit">Login</button>
                    <h4>Don't have an account? <Link to='/signup'>Signup</Link></h4>
                </LoginInputContainer>
            
        </LoginContainer>
    );
};

export default Login;