import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CenterWrapper,
  CreateFormContainer,
  CreateFormChooseSurvey,
  HeaderContainer,
  TitleInput,
  DescInput,
  QuestionTypeContainer,
  Button,
} from "./createform.styled";
import { YesNoSurveyAdd } from "../../Components/YesNoSurvey/YesNoSurveyAdd";
import { DropDownSurveyAdd } from "../../Components/DropDownSurvey/DropDownSurveyAdd";
import { CustomInputAdd } from "../../Components/CustomInputSurvey/CustomInputAdd";

const CreateForm = () => {
  const [dropDownValue, setDropDownValue] = useState("yes/no");
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const questionRefs = useRef([]);

  const handleDropDownChange = (e) => {
    setDropDownValue(e.target.value);
  };

  const handleAddSurvey = () => {
    setQuestions([...questions, { type: dropDownValue }]);
  };

  const handleSaveSurvey = async () => {
    if (!title) {
      toast.error("Please add a title first");
      return;
    }

    const surveyId = window.localStorage.getItem("_auth_state");
    const user_id = JSON.parse(surveyId).user_id;

    const surveyData = {
      owner: {
        id: user_id,
      },
      title: title,
      description: description,
    };

    try {
      const surveyRes = await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/survey`,
        surveyData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (surveyRes.status === 200) {
        const surveyId = surveyRes.data._id;
        window.localStorage.setItem("surveyId", surveyId);

        for (let i = 0; i < questions.length; i++) {
          try {
            const questionData = questionRefs.current[i].getData();
            console.log(questionData);
            const questionRes = await axios.post(
              `${process.env.REACT_APP_API_ADDRESS}/survey/${surveyId}/questions`,
              questionData,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
            console.log(questionRes);
          } catch (error) {
            toast.error(error.message);
            return;
          }
        }

        toast.success("Survey and all questions saved successfully");
      } else {
        toast.error("Something went wrong while saving the survey");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("Title already exists");
      } else {
        toast.error("An error occurred while saving the survey");
      }
    }
  };

  const QuestionComponent = useCallback(({ type, index }) => {
    switch (type) {
      case "yes/no":
        return (
          <YesNoSurveyAdd ref={(el) => (questionRefs.current[index] = el)} />
        );
      case "dropdown":
        return (
          <DropDownSurveyAdd ref={(el) => (questionRefs.current[index] = el)} />
        );
      case "custom":
        return (
          <CustomInputAdd ref={(el) => (questionRefs.current[index] = el)} />
        );
      default:
        return null;
    }
  }, []);

  return (
    <CenterWrapper>
      <CreateFormContainer>
        <HeaderContainer>
          <TitleInput
            type="text"
            name="survey title"
            placeholder="Survey Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <DescInput
            type="text"
            name="survey description"
            placeholder="Survey Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </HeaderContainer>

        <QuestionTypeContainer>
          {questions.map((q, index) => (
            <QuestionComponent key={index} type={q.type} index={index} />
          ))}
        </QuestionTypeContainer>

        <CreateFormChooseSurvey>
          <div style={{ display: "flex", gap: "25px" }}>
            <h2>Type : </h2>
            <select value={dropDownValue} onChange={handleDropDownChange}>
              <option value="yes/no">Yes/No</option>
              <option value="dropdown">Drop-Down</option>
              <option value="custom">Custom Input</option>
            </select>
            <Button onClick={handleAddSurvey}>Add</Button>
          </div>

          <Button
            style={{ backgroundColor: "green" }}
            onClick={handleSaveSurvey}
          >
            Save
          </Button>
        </CreateFormChooseSurvey>
      </CreateFormContainer>
    </CenterWrapper>
  );
};

export default CreateForm;
