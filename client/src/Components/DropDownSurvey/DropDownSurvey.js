import React from "react";
import { DropDownContainer } from "./dropdownsurvey.styled";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const DropDownSurvey = ({ questionNo, question, options, _id }) => {
  const [selected, setSelected] = useState(null);
  const survey_id = useParams().id;
  const user_id = JSON.parse(
    window.localStorage.getItem("_auth_state"),
  ).user_id;

  const handleClick = async (e) => {
    if (selected === null) {
      toast.error("Please select an option");
      return;
    }
    const auth_token = window.localStorage.getItem("_auth");
    const data = {
      survey: {
        id: survey_id,
      },
      question: {
        id: _id,
      },
      answer: selected,
      respondent: {
        id: user_id,
      },
    };
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/survey/${survey_id}/responses`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );
      console.log(res.data);
      toast.success("Response saved");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <DropDownContainer>
      <h3>
        Question <span>{questionNo + 1}</span>
      </h3>
      <h1>{question}</h1>
      <select
        onChange={(e) => {
          setSelected(e.target.value);
        }}
      >
        {options.map((option, index) => {
          return (
            <option key={index} value={option}>
              {option}
            </option>
          );
        })}
      </select>
      <button onClick={handleClick}>Save</button>
    </DropDownContainer>
  );
};
