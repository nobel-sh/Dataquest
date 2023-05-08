import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavbarContainer = styled.nav`
    width: 100%;
    height: 10vh;
    background-color: #020B19;
    display: flex;
    justify-content: center;
    align-items: center;
`
export const NavbarLogoContainer = styled.div`
    flex: 60%;
    padding-left: 40px;
`

export const NavbarLinksContainer = styled.div`
    flex:40%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-content: center;
    color: white;
    margin-right: 10vw;
`

export const NavbarImage = styled.img`
    margin: 20px;
    max-width: 90px;
    height: auto;
`
export const NavbarLink = styled(Link)`
    text-decoration: none;
    color:white;
    font-size: x-large;
    padding-top: 1rem;
    &:focus{
    color: white;
    }
    &:active{
    color: black;
    };
`