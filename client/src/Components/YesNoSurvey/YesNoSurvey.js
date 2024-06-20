import React, { useState } from "react";
import { YesNoContainer, YesNoOptionsContainer } from "./yesnosurvey.styled";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export const YesNoSurvey = ({ questionNo, question, options, _id }) => {
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
    <YesNoContainer>
      <h3>
        Question <span>{questionNo + 1}</span>
      </h3>
      <h1>{question}</h1>
      <YesNoOptionsContainer>
        <button
          style={
            selected !== null
              ? {
                  backgroundColor: selected === options[0] ? "#8da5aa" : "grey",
                }
              : { backgroundColor: "grey" }
          }
          onClick={() => {
            setSelected(options[0]);
          }}
        >
          {" "}
          {options[0]}
        </button>
        <button
          style={
            selected !== null
              ? {
                  backgroundColor: selected === options[1] ? "#8da5aa" : "grey",
                }
              : { backgroundColor: "grey" }
          }
          onClick={() => {
            setSelected(options[1]);
          }}
        >
          {" "}
          {options[1]}
        </button>
      </YesNoOptionsContainer>
      <button onClick={handleClick}>Save</button>
    </YesNoContainer>
  );
};
