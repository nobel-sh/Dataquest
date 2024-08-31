import React, { useState, useEffect } from "react";
import {
  ProfileContainer,
  ProfileImage,
  LogoutButton,
  EditButton,
} from "./profile.styled";
import { toSvg } from "jdenticon";
import { useSignOut } from "react-auth-kit";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../../Components/Modal/modal.js";

export const Profile = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [identiconSvg, setIdenticonSvg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const signout = useSignOut();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const user_state = window.localStorage.getItem("_auth_state");
    if (user_state) {
      const parsedUserState = JSON.parse(user_state);
      setUserName(parsedUserState.username);
      setUserEmail(parsedUserState.email);
      const svg = toSvg(parsedUserState.email, 100);
      setIdenticonSvg(svg);
    }
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem("_auth_state");
    window.localStorage.removeItem("_auth");
    signout();
    navigate("/login");
    navigate(0);
  };

  const handleEditProfile = () => {};

  return (
    <>
      <ProfileContainer>
        <ProfileImage dangerouslySetInnerHTML={{ __html: identiconSvg }} />
        <h2>{userName}</h2>
        <h3>{userEmail}</h3>
        <EditButton onClick={openModal}>Edit</EditButton>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </ProfileContainer>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Edit Profile</h2>
        <form>
          <label>Username:</label>
          <input type="text" name="username" />
          <label>Email:</label>
          <input type="email" name="email" />
          <button type="submit">Save Changes</button>
        </form>
      </Modal>
    </>
  );
};

export default Profile;
