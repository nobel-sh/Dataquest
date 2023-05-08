import React from 'react'
import {NavbarContainer,NavbarLogoContainer,NavbarLinksContainer,NavbarImage, NavbarLink}from '../../Styles/navbar.styled'
import TitleStyled from '../../Styles/Title.styled'
import LogoImg from '../../pictures/placeholder_logo.png'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className=''>

        <NavbarContainer>
            <NavbarLogoContainer>
              <Link to='/'>
                <NavbarImage src={LogoImg} alt='dataquest logo'/>
              </Link>
            </NavbarLogoContainer>
            <NavbarLinksContainer>
              <NavbarLink to={'/forms'}>Forms</NavbarLink>
              <NavbarLink to={'/templates'}>Template</NavbarLink>
              <NavbarLink to={'/user'}>User</NavbarLink>
            </NavbarLinksContainer>
        </NavbarContainer>

    </div>
  )
}

export default Navbar