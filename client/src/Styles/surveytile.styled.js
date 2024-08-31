import styled from "styled-components";

export const SurveyTileContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1em;
  padding: 2em;
  border-radius: 8px;
  align-items: center;
  background-color: #f9f9f9; 
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid ligtgray;
  h3 {
    font-weight: 400;
    font-size: 1rem;
    margin: 1em 0;
    color: #333333;
  }
`;

export const SurveyTileTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

export const SurveyTileDottedlines = styled.div`
  border-bottom: 2px dashed #a0a0a0;
  width: 100%;
  margin: 1em 0;
`;

export const SurveyTileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 1em 0;
`;

export const SurveyTileInfoText = styled.h3`
  font-size: 1rem;
  font-weight: 400;
`;

export const SurveyTileOpenButton = styled.button`
  color: white;
  background-color: #1e90ff;
  border-radius: 8px;
  height: 2.5em;
  padding: 0 1.5em;
  font-size: 1rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #1c86ee;
  }
`;

export const LinkContainer = styled.div`
  padding: 0.5em 0;
  width: 100%;
  text-align: center;

  a {
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #1c86ee;
    }
  }
`;

