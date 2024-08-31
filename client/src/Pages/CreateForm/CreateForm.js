import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CenterWrapper,
  CreateFormContainer,
  HeaderContainer,
  TitleInput,
  DescInput,
  QuestionTypeContainer,
  CreateFormChooseSurvey,
  Button,
  FloatingSaveButton,
} from "./createform.styled";
import { YesNoSurveyAdd } from "../../Components/YesNoSurvey/YesNoSurveyAdd";
import { DropDownSurveyAdd } from "../../Components/DropDownSurvey/DropDownSurveyAdd";
import { CustomInputAdd } from "../../Components/CustomInputSurvey/CustomInputAdd";
import { MdSave } from "react-icons/md";

const QUESTION_COMPONENTS = {
  "yes/no": YesNoSurveyAdd,
  dropdown: DropDownSurveyAdd,
  custom: CustomInputAdd,
};

const CreateForm = () => {
  const [dropDownValue, setDropDownValue] = useState("yes/no");
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const questionRefs = useRef([]);

  const handleDropDownChange = (e) => setDropDownValue(e.target.value);

  const handleAddSurvey = () => setQuestions([...questions, { type: dropDownValue }]);

  const handleSaveSurvey = async () => {
    if (!title) {
      toast.error("Please add a title first");
      return;
    }

    const user_state = JSON.parse(window.localStorage.getItem("_auth_state"));
    const auth_token = window.localStorage.getItem("_auth");
    const surveyData = { owner: { id: user_state.user_id }, title, description };

    try {
      const surveyRes = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/survey`, surveyData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth_token}` },
      });

      if (surveyRes.status === 200) {
        await Promise.all(
          questions.map((_, index) => {
            const questionData = questionRefs.current[index]?.getData();
            return axios.post(
              `${process.env.REACT_APP_API_ADDRESS}/survey/${surveyRes.data._id}/questions`,
              questionData,
              {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth_token}` },
              }
            );
          })
        );

        toast.success("Survey and all questions saved successfully");
      } else {
        toast.error("Something went wrong while saving the survey");
      }
    } catch (error) {
      toast.error(error.response?.status === 400 ? "Title already exists" : "An error occurred while saving the survey");
    }
  };

  const QuestionComponent = useCallback(({ type, index }) => {
    const Component = QUESTION_COMPONENTS[type];
    return Component ? <Component ref={(el) => (questionRefs.current[index] = el)} /> : null;
  }, []);

  return (
    <CenterWrapper>
      <CreateFormContainer>
        <HeaderContainer>
          <TitleInput
            type="text"
            placeholder="Survey Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <DescInput
            type="text"
            placeholder="Survey Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </HeaderContainer>

      {questions.length < 1? <p style={{ color: "black", fontSize: "1.5em" , margin:"1em"}}>add questions to your survey</p> : 
        <QuestionTypeContainer>
          {questions.map((q, index) => (
            <QuestionComponent key={index} type={q.type} index={index} />
          ))}
        </QuestionTypeContainer>
}

        <CreateFormChooseSurvey>
          <div style={{ display: "flex", gap: "25px" }}>
            <select value={dropDownValue} onChange={handleDropDownChange}>
              <option value="yes/no">Yes/No</option>
              <option value="dropdown">Drop-Down</option>
              <option value="custom">Custom Input</option>
            </select>
            <Button onClick={handleAddSurvey}>Add</Button>
          </div>
        </CreateFormChooseSurvey>

      <FloatingSaveButton onClick={handleSaveSurvey}>
          <p>
            <MdSave />
            Save
          </p>
        </FloatingSaveButton>
      </CreateFormContainer>
    </CenterWrapper>
  );
};

export default CreateForm;

