import React from 'react'
import { SidebarContainer, SidebarText,SidebarLink } from '../../Styles/sidebar.styled'
import {FaClipboardList,FaChartBar,FaUser,FaSignOutAlt} from 'react-icons/fa'


const Sidebar = () => {
  return (
    <>
    <SidebarContainer>
        <SidebarLink to={'/forms'}>
        <SidebarText><FaClipboardList/> Forms</SidebarText>
        </SidebarLink>
        
        <SidebarLink  to={'/Results'}>
        <SidebarText><FaChartBar/>  Results</SidebarText>
        </SidebarLink>
        
        <SidebarLink  to={'/Profile'}>
        <SidebarText><FaUser/> Profile</SidebarText>
        </SidebarLink>
        
        <SidebarLink  to={'/logout'}>
        <SidebarText><FaSignOutAlt/>Logout</SidebarText>
        </SidebarLink>
        
    </SidebarContainer>
    </>
  )
}

export default Sidebar