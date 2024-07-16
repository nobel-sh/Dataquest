import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavbarContainer = styled.nav`
  width: 100%;
  height: 10vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: gainsboro;
`;

export const NavbarLogoContainer = styled.div`
  flex: 70%;
  padding: 4px;
  padding-left: 40px;
`;

export const NavbarLinksContainer = styled.div`
  flex: 30%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-content: center;
  margin-right: 10vw;
`;

export const NavbarImage = styled.img`
  margin: 20px;
  max-width: 60px;
  height: auto;
`;

export const NavbarLink = styled(Link)`
  text-decoration: none;
  font-size: x-large;
  padding-top: 1rem;
`;
