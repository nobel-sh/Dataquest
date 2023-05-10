import React from 'react'
import { SignupContainer, SignupInputContainer } from './signup.styled'
import { useRef } from 'react'
import { useSignIn } from 'react-auth-kit'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


export const Signup = () => {
    const username = useRef(null);
    const email = useRef(null);
    const password = useRef(null);
    const confirmPassword = useRef(null);
    const SignIn = useSignIn();
    const navigate = useNavigate();
    

    const handleSubmit = async (e) => {

        if(password.current.value !== confirmPassword.current.value){
            alert("Passwords do not match");
            return;
        }
        if(password.current.value.length < 8){
            alert("Password must be atleast 8 characters long");
            return;
        }
        if(username.current.value.length < 3){
            alert("Username must be atleast 3 characters long");
            return;
        }

        e.preventDefault();
        const data = {
            username:username.current.value,
            email:email.current.value,
            password:password.current.value,
        }

        console.log(data);

        const res = await axios.post('http://localhost:4949/api/v1/user/register',data,{
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(res.status===200 ){
            await navigate('/login/*');
        }else{
            alert("User already exists");
        }
        console.log(res.data);
    }
  return (
    <SignupContainer>
        
        <SignupInputContainer>
            <h1>Signup</h1>
            <h2>Username</h2>
            <input type="text" placeholder="Enter username" ref={username}/>
            <h2>Email</h2>
            <input type="email" placeholder="Enter email" ref={email}/>
            <h2>Password</h2>
            <input type="password" placeholder="Enter password" ref={password}/>
            <h2>Confirm Password</h2>
            <input type="password" placeholder="Re enter password" ref={confirmPassword}/>
            <button type="submit" onClick={handleSubmit}>Signup</button>

        </SignupInputContainer>
    </SignupContainer>
  )
}
