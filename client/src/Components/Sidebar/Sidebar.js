import React, { useState } from "react";
import {
  SidebarContainer,
  SidebarText,
  SidebarLink,
  SidebarImage,
  SidebarLogout,
  SidebarRoutes,
} from "../../Styles/sidebar.styled";
import LogoImg from "../../pictures/logo1.png";
import Modal from "../Modal/modal.js";
import { Profile } from "../../Pages/Profile/profile.js";
import { Link, useNavigate } from "react-router-dom";
import { useSignOut } from "react-auth-kit";

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const signout = useSignOut();

  const handleSignout = () => {
    signout();
    navigate("/login");
    window.location.reload(); // Refresh the page to ensure logout
  };

  const openProfileModal = () => {
    setIsModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <SidebarContainer>
        <Link to="/">
          <SidebarImage src={LogoImg} alt="DataQuest Logo" />
        </Link>
        <SidebarRoutes>
          <SidebarLink to={"/"}>
            <SidebarText>Dashboard</SidebarText>
          </SidebarLink>
          <SidebarLink to={"/forms"}>
            <SidebarText>Create</SidebarText>
          </SidebarLink>
          <SidebarLink onClick={openProfileModal} style={{ cursor: "pointer" }}>
            <SidebarText>Profile</SidebarText>
          </SidebarLink>
          <SidebarLogout>
            <SidebarLink to={"/login"} onClick={handleSignout}>
              <SidebarText>Logout</SidebarText>
            </SidebarLink>
          </SidebarLogout>
        </SidebarRoutes>
      </SidebarContainer>
      <Modal isOpen={isModalOpen} onClose={closeProfileModal}>
        <Profile />
      </Modal>
    </>
  );
};

export default Sidebar;

