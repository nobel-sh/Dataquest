import React from "react";
import {
  NavbarContainer,
  NavbarLogoContainer,
  NavbarLinksContainer,
  NavbarImage,
  NavbarLink,
} from "../../Styles/navbar.styled";
import LogoImg from "../../pictures/logo1.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <NavbarContainer>
      <NavbarLogoContainer>
        <Link to="/">
          <NavbarImage src={LogoImg} alt="dataquest logo" />
        </Link>
      </NavbarLogoContainer>
      <NavbarLinksContainer>
        <NavbarLink to={"/forms"}>Forms</NavbarLink>
        <NavbarLink to={"/templates"}>Template</NavbarLink>
        <NavbarLink to={"/user"}>User</NavbarLink>
      </NavbarLinksContainer>
    </NavbarContainer>
  );
};

export default Navbar;
