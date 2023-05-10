import React from 'react'
import { SidebarContainer, SidebarText,SidebarLink } from '../../Styles/sidebar.styled'
import {FaClipboardList,FaChartBar,FaUser,FaSignOutAlt} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import {  useSignOut } from 'react-auth-kit'

const Sidebar = () => {
  const navigate = useNavigate();
  const signout = useSignOut();

  const handleSignout = () => {
    console.log("signout");
    signout();
    navigate('/login');
    navigate(0);
  }

  const handleForms = () => {
    console.log("form");
    navigate('/forms');

  }
  return (
    <>
    <SidebarContainer>
        <SidebarLink to={'/forms'} onClick>
        <SidebarText><FaClipboardList/> Forms</SidebarText>
        </SidebarLink>
        

        <SidebarLink to={'/login'}onClick={handleSignout}>
        <SidebarText><FaSignOutAlt/>Logout</SidebarText>
        </SidebarLink>
        

    </SidebarContainer>
    </>
  )
}

export default Sidebar