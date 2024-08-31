import styled from "styled-components";
import { Link } from "react-router-dom";

export const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16em;
  height: 100vh;
  background-color: #f9f9f9; 
  padding: 1.5rem 0;
  gap: 4em;
`;

export const SidebarImage = styled.img`
  max-width: 160px; 
  height: auto;
  margin: 2rem;
`;


export const SidebarRoutes = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const SidebarText = styled.h2`
  font-size: 1rem;
  font-weight: 500;
  margin: 0.5rem;
  color: inherit;
  text-align: center;
`;

export const SidebarLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  width: 100%;
  padding: 0.5rem 0;
  text-align: center;

  &:hover {
    background-color: #d0d0d0;
  }
`;

export const SidebarLogout = styled.div`
  width: 100%;
  padding: 12px;
  border-top: 1px solid #ccc;
  &:hover {
    background-color: #c0c0c0;
  }
`;

