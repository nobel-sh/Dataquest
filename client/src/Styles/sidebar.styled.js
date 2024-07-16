import styled from "styled-components";
import { Link } from "react-router-dom";

export const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 16em;
  height: auto;
  background-color: #213458;
  color: white;
`;

export const SidebarText = styled.h2`
  font-size: 1em;
  font-weight: 500;
  padding: 12px;
  padding-right: 10px;
  &:hover {
    background-color: rgba(112, 43, 208, 255);
    border-radius: 10px;
  }
`;
export const SidebarRoutes = styled.div`
  flex: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 2%;
`;

export const SidebarLink = styled(Link)`
  text-decoration: none;
  color: white;
  font-size: x-large;
`;
export const SidebarImage = styled.img`
  flex: 1;
  margin: 20px;
  max-width: 90px;
  height: auto;
`;
export const SidebarLogout = styled.div``;
