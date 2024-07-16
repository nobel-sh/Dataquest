import React from "react";
import {
  SidebarContainer,
  SidebarText,
  SidebarLink,
  SidebarImage,
  SidebarLogout,
  SidebarRoutes,
} from "../../Styles/sidebar.styled";
import { FaClipboardList, FaSignOutAlt, FaHome } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSignOut } from "react-auth-kit";
import LogoImg from "../../pictures/logo1.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const signout = useSignOut();

  const handleSignout = () => {
    console.log("signout");
    signout();
    navigate("/login");
    navigate(0);
  };

  return (
    <>
      <SidebarContainer>
        <Link to="/">
          <SidebarImage src={LogoImg} alt="dataquest logo" />
        </Link>
        <SidebarRoutes>
          <SidebarLink to={"/"} k>
            <SidebarText>
              <FaHome /> Home
            </SidebarText>
          </SidebarLink>

          <SidebarLink to={"/forms"}>
            <SidebarText>
              <FaClipboardList /> Create
            </SidebarText>
          </SidebarLink>

          <SidebarLogout>
            <SidebarLink to={"/login"} onClick={handleSignout}>
              <SidebarText>
                <FaSignOutAlt /> Logout
              </SidebarText>
            </SidebarLink>
          </SidebarLogout>
        </SidebarRoutes>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
