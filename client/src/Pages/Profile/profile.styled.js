import styled from "styled-components";

export const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: gainsboro;
  margin: 1em;
`;

export const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  background-color: white;
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const EditButton = styled.button`
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 6em;
  &:hover {
    background-color: #66bb6a;
  }
`;

export const LogoutButton = styled.button`
  padding: 10px 20px;
  background-color: #ff4b5c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 6em;
  &:hover {
    background-color: #ff6b7c;
  }
`;
