import React from "react";
import { SignupContainer, SignupInputContainer } from "./signup.styled";
import { useRef } from "react";
import { useSignIn } from "react-auth-kit";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const Signup = () => {
  const username = useRef(null);
  const email = useRef(null);
  const password = useRef(null);
  const confirmPassword = useRef(null);
  const SignIn = useSignIn();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (password.current.value !== confirmPassword.current.value) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.current.value.length < 8) {
      toast.error("Password must be atleast 8 characters long");
      return;
    }
    if (username.current.value.length < 3) {
      toast.error("Username must be atleast 3 characters long");
      return;
    }

    e.preventDefault();
    const data = {
      username: username.current.value,
      email: email.current.value,
      password: password.current.value,
    };

    console.log(data);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/user/register`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (res.status === 200) {
        await navigate("/login");
      }
      console.log(res);
    } catch (err) {
      toast.error("User already exists");
      return false;
    }
  };
  return (
    <SignupContainer>
      <SignupInputContainer>
        <h1>Signup</h1>
        <label>Username</label>
        <input type="text" placeholder="Enter username" ref={username} />
        <label>Email</label>
        <input type="email" placeholder="Enter email" ref={email} />
        <label>Password</label>
        <input type="password" placeholder="Enter password" ref={password} />
        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Re enter password"
          ref={confirmPassword}
        />
        <button type="submit" onClick={handleSubmit}>
          Signup
        </button>
      </SignupInputContainer>
    </SignupContainer>
  );
};
