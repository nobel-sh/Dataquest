import React, { useState, useEffect } from "react";
import {
  NavbarContainer,
  NavbarLogoContainer,
  NavbarLinksContainer,
  NavbarImage,
  NavbarLink,
  NavbarButton,
} from "../../Styles/navbar.styled";
import LogoImg from "../../pictures/logo1.png";
import Modal from "../Modal/modal.js";
import { toSvg } from "jdenticon";
import { Link } from "react-router-dom";
import { Profile } from "../../Pages/Profile/profile.js";

const Navbar = () => {
  const [userInfo, setUserInfo] = useState({ userName: "", userEmail: "", identiconSvg: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    const userState = window.localStorage.getItem("_auth_state");
    if (userState) {
      const { username, email } = JSON.parse(userState);
      setUserInfo({
        userName: username,
        userEmail: email,
        identiconSvg: toSvg(email, 100),
      });
    }
  }, []);

  return (
    <>
      <NavbarContainer>
        <NavbarLogoContainer>
          <Link to="/">
            <NavbarImage src={LogoImg} alt="DataQuest Logo" />
          </Link>
        </NavbarLogoContainer>
        <NavbarLinksContainer>
          <NavbarLink to="/forms">Forms</NavbarLink>
          <NavbarLink to="/templates">Templates</NavbarLink>
          <NavbarButton onClick={toggleModal}>User</NavbarButton>
        </NavbarLinksContainer>
      </NavbarContainer>
      <Modal isOpen={isModalOpen} onClose={toggleModal}>
        <Profile />
      </Modal>
    </>
  );
};

export default Navbar;

