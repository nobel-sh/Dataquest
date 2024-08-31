import styled from "styled-components";

export const DropDownAddContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2em;
  border-radius: 2px;
  background-color: #f9f9f9; 
  border : 1px solid gray;
  width: 60em;
  input{
    margin: 10px; 
    height: 30px;
  }
`;

export const DropDownButton = styled.button`
  padding: 1em; 
  border: none;
  border-radius: 4px;
  font-size: 1em;
  font-weight: 500;
  background-color: gainsboro; 
`;

export const DropDownQuestionContainer = styled.input`
  border-radius: 2px;
  min-width: 50rem;
  height: 30px;
  font-size: larger;
  font-weight: 500;
  padding: 1em;
  border: 1px solid black;
`;

export const DropDownAnswersContainer = styled.input`
  height: 20px;
  width: 20rem;
  padding: 3px;
`;
