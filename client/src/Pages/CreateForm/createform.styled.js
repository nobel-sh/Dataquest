import styled from "styled-components";

export const CenterWrapper = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
`;

export const CreateFormContainer = styled.div`
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  margin: 2em;
  padding: 2em;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative; 
  border: 1px solid gray;
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 1em;
  width: 55em;

  input {
    padding-left: 1em;
    border: 1px solid gray;
    border-radius: 2px;
    font-size: 16px;
    color: black;
    margin-bottom: 1em;
  }
`;

export const TitleInput = styled.input`
  min-height: 48px;
`;

export const DescInput = styled.input`
  min-height: 36px;
`;

export const CreateFormChooseSurvey = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;

  select {
    padding: 12px;
    font-size: 16px;
    border: 1px solid gray;
    border-radius: 2px;
  }

  h2{
    font-weight: 500;
    margin: 0;
  }
`;

export const Button = styled.button`
  text-align: center;
  background-color: gray;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #aaa;
  }
`;

export const QuestionTypeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 1em;
  border: 1px solid black;
  margin: 1em;
  border-radius: 4px;
`;

export const FloatingSaveButton = styled(Button)`
  background-color: lightgreen;
  color: white;
  width: 120px;
  height: 60px;
  border-radius: 16px; 
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  padding: 2px;
  margin: 1em;
  &:hover {
    background-color: green; 
  }
  p {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;