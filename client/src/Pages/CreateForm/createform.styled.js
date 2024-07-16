import styled from "styled-components";

export const CenterWrapper = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
`;
export const CreateFormContainer = styled.div`
  background-color: gainsboro;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 2em;
  padding: 2em;
  border-radius: 4px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 8em;
  justify-content: space-around;
  padding: 1em;
  width: 50em;
  input {
    padding-left: 1em;
    border: none;
    border-radius: 5px;
    margin: 8px;
  }
`;

export const TitleInput = styled.input`
  font-size: 16px;
  min-height: 48px;
  border: none;
`;

export const DescInput = styled.input`
  font-size: 14px;
  min-height: 36px;
`;

export const CreateFormChooseSurvey = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  justify-content: space-around;
  width: 100%;
  margin: 1em;

  select {
    padding: 12px;
    font-size: 16px;
    color: black;
    border: none;
    border-radius: 4px;
  }
`;

export const Button = styled.div`
  text-align: center;
  background-color: gray;
  color: white;
  padding: 2em;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 4px;
`;

export const QuestionTypeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 1em;
`;
