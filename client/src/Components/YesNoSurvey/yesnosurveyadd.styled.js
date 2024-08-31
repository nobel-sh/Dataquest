import styled from "styled-components";

export const YesNoAddContainer = styled.div`
  border: 1px solid gray; 
  display: flex;
  flex-direction: column;
  padding: 2em;
  align-items: center;
  background-color: #f9f9f9; 
  border-radius: 2px;
  width: 60em; 
`;

export const YesNoQuestionContainer = styled.input`
  border-radius: 2px;
  min-width: 50rem;
  height: 30px;
  font-size: larger;
  font-weight: 500;
  padding: 1em;
  border: 1px solid gray;
`;

export const YesNoOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2em;
  width: 100%;
  justify-content: space-around;

  input {
    width: 10em;
    padding: 8px;
    font-size: 14px;
    border-radius: 2px;
    border: 1px solid gray;
  }

  button {
    decoration: none;
    border-radius: 4px;
  }
`;
