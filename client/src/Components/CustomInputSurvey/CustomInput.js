import React from "react";
import { CustomInputContainer } from "./custominput.styled";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export const CustomInput = ({ questionNo, question, _id }) => {
  const survey_id = useParams().id;
  const answer = useRef(null);
  const user_id = JSON.parse(
    window.localStorage.getItem("_auth_state"),
  ).user_id;

  const handleClick = async (e) => {
    const user_state = window.localStorage.getItem("_auth_state");
    const auth_token = window.localStorage.getItem("_auth");

    if (!user_state) {
      toast.error("Please log in.");
      return;
    }

    const owner_id = JSON.parse(user_state).user_id;

    if (!owner_id || !auth_token) {
      toast.error("Please log in.");
      return;
    }
    const data = {
      survey: {
        id: survey_id,
      },
      question: {
        id: _id,
      },
      answer: answer.current.value,
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
    <CustomInputContainer>
      <h3>
        Question <span>{questionNo + 1}</span>
      </h3>
      <h1>{question}</h1>
      <input type="text" ref={answer} />
      <button onClick={handleClick}>Save</button>
    </CustomInputContainer>
  );
};
