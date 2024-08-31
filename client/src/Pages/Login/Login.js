import React, { useState, useRef } from "react";
import { LoginContainer, LoginInputContainer } from "./login.styled";
import { useSignIn } from "react-auth-kit";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LogoImg from "../../pictures/logo1.png";

export const Login = () => {
  const email = useRef(null);
  const password = useRef(null);
  const SignIn = useSignIn();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      email: email.current.value,
      password: password.current.value,
    };
    try {
      console.log(process.env);
      const res = await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/user/login`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log(res);
      if (res.status === 200) {
        navigate("/dashboard/", { replace: true });
        navigate(0);
      }
      SignIn({
        token: res.data.accessToken,
        expiresIn: res.data.expiresIn,
        authState: res.data.user,
        tokenType: "Bearer",
      });
    } catch (err) {
      console.log(err);
      toast.error("Invalid Credentials");
      return false;
    }
  };
  return (
    <LoginContainer>
      <img src={LogoImg} alt="logo" />
      <h1> Login</h1>
      <LoginInputContainer onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" placeholder="Enter Email" ref={email} />
        <label>Password</label>
        <input type="password" placeholder="Enter Password" ref={password} />
        <button type="submit">Login</button>
        <h3>
          Don't have an account? <Link to="/signup">Signup</Link>
        </h3>
      </LoginInputContainer>
    </LoginContainer>
  );
};

export default Login;
