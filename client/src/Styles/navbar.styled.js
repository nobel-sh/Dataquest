import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavbarContainer = styled.nav`
  width: 100%;
  height: 10vh;
  display: flex;
  justify-content: space-evenly; 
  align-items: center;
  background-color: gainsboro;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 8vh;
  }
`;

export const NavbarLogoContainer = styled.div`
  flex: 5;
  padding: 4px;
  @media (max-width: 768px) {
    padding-left: 10px;
  }
`;

export const NavbarLinksContainer = styled.div`
  flex: 4;
  display: flex;
  justify-content: space-evenly; 
  align-items: center;
  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: space-around;
    margin-right: 0;
  }
`;

export const NavbarImage = styled.img`
  max-width: 60px;
  height: auto;

  @media (max-width: 768px) {
    max-width: 50px;
  }
`;

export const NavbarLink = styled(Link)`
  text-decoration: none;
  font-size: 1.5rem;
  color: black;
  margin-right: 2rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-right: 1rem;
  }
`;

export const NavbarButton = styled.button`
  font-size: 1.5rem;
  background: none;
  border: none;
  color: black;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

