import styled from "styled-components";

export const DropDownAddContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1em;
  padding: 2em;
  margin-right: 2rem;
  border-radius: 4px;
  background-color: rgb(200, 200, 200);
  input {
    margin: 1em;
    margin-left: 12px;
    border: 0;
    height: 25px;
    width: 10rem;
    border-radius: 5px;
    height: 30px;
  }
`;
export const DropDownButton = styled.button`
  padding: 8px;
  height: 3em;
  border: none;
  background-color: green;
  color: white;
  border-radius: 4px;
`;

export const DropDownQuestionContainer = styled.input`
  min-width: 50rem;
  padding: 1em;
  margin: 1em;
`;

export const DropDownAnswersContainer = styled.input`
  height: 20px;
  width: 20rem;
  padding: 3px;
`;
