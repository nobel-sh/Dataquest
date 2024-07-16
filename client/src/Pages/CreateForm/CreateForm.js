import React from "react";
import {
  CenterWrapper,
  CreateFormContainer,
  CreateFormChooseSurvey,
  HeaderContainer,
  TitleInput,
  DescInput,
  QuestionTypeContainer,
  PlusButton,
} from "./createform.styled";
import { useState } from "react";
import { YesNoSurveyAdd } from "../../Components/YesNoSurvey/YesNoSurveyAdd";
import { DropDownSurveyAdd } from "../../Components/DropDownSurvey/DropDownSurveyAdd";
import { CustomInputAdd } from "../../Components/CustomInputSurvey/CustomInputAdd";
import axios from "axios";
import { BsPlusSquareFill } from "react-icons/bs";
import { toast } from "react-toastify";

const CreateForm = () => {
  const [dropDownValue, setDropDownValue] = useState("yes/no");
  const [questions, setQuestions] = useState([]);

  const handleDropDownChange = (e) => {
    setDropDownValue(e.target.value);
    console.log(e.target.value);
  };

  const handleAddSurvey = () => {
    console.log(dropDownValue);
    if (dropDownValue === "yes/no") {
      questions.push();
      setQuestions([...questions, <YesNoSurveyAdd />]);
      return;
    } else if (dropDownValue === "dropdown") {
      setQuestions([...questions, <DropDownSurveyAdd />]);
      return;
    } else {
      setQuestions([...questions, <CustomInputAdd />]);
    }
  };

  const handleTitle = async (e) => {
    // const surveyId = window.localStorage.getItem("_auth_state");
    // const user_id = JSON.parse(surveyId).user_id;
    // console.log(e.target.value);
    // const data = {
    //   owner: {
    //     id: user_id,
    //   },
    //   title: e.target.value,
    // };
    // const res = await axios.post(
    //   `${process.env.REACT_APP_API_ADDRESS}/survey`,
    //   data,
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   },
    // );
    // console.log(res.data);
    // if (res.status === 200) {
    //   toast.info("Survey Added");
    //   window.localStorage.setItem("surveyId", res.data._id);
    // } else if (res.status === 400) {
    //   toast.error("Title already exists");
    //   return;
    // } else {
    //   toast.error("Something went wrong");
    // }
  };

  return (
    <CenterWrapper>
      <CreateFormContainer>
        <HeaderContainer>
          <TitleInput
            type="text"
            name="survey title"
            placeholder="Survey Title"
            onBlur={handleTitle}
          />
          <DescInput
            type="text"
            name="survey description"
            placeholder="Survey Description"
            onBlur={handleTitle}
          />
        </HeaderContainer>

        <QuestionTypeContainer>{questions}</QuestionTypeContainer>

        <CreateFormChooseSurvey>
          <h2>Type : </h2>
          <select value={dropDownValue} onChange={handleDropDownChange}>
            <option value="yes/no">Yes/No</option>
            <option value="dropdown">Drop-Down</option>
            <option value="custom">Custom Input</option>
          </select>
          <PlusButton onClick={handleAddSurvey}>ADD</PlusButton>
        </CreateFormChooseSurvey>
      </CreateFormContainer>
    </CenterWrapper>
  );
};

export default CreateForm;
