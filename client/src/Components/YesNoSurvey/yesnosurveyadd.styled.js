import styled from "styled-components";

export const YesNoAddContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2em;
  align-items: center;
  background-color: rgb(200, 200, 200);
  button {
    height: 40px;
    width: 60px;
    border: none;
    font-size: larger;
    font-weight: 500;
  }
`;
export const YesNoQuestionContainer = styled.input`
  border-radius: 4px;
  min-width: 40rem;
  height: 30px;
  border: none;
  font-size: larger;
  font-weight: 500;
  padding: 1em;
`;

export const YesNoOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 1em;
  width: 100%;
  justify-content: space-around;

  input {
    border: none;
    width: 10em;
    padding: 12px;
    margin: 1em;
    font-size: 13px;
    border-radius: 4px;
  }

  button {
    decoration: none;
    border-radius: 4px;
  }
`;
