import styled from "styled-components";

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2em;
  height: 100vh;

  @media (max-width: 768px) {
    padding: 1em;
  }
`;

export const Heading = styled.h1`
  font-weight: 600;
  margin: 1em;
  @media (max-width: 768px) {
    font-size: 1.25em;
  }
`;
export const SubHeading = styled.h3`
  font-weight: 500;
  margin: 1em; 
  font-size: 1.5em;
  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

export const Message = styled.div`
  margin: 2em;
  background-color: #f9f9f9;
  padding: 2em;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    margin: 1em;
  }
`;

export const SurveyTileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5em;
  justify-items: center;
  width: 100%;
  overflow-y: scroll; 
`;

