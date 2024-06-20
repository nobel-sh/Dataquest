import React, { useRef } from "react";
import {
  CustomInputAddContainer,
  CustomInputQuestionContainer,
} from "./custominputadd.styled";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CustomInputAdd = () => {
  const Title = useRef(null);
  const handleSubmit = async () => {
    if (Title.current.value === "") {
      toast.error("Please add title");
      return;
    }

    if (window.localStorage.getItem("surveyId") == null) {
      toast.error("Please add title first");
      return;
    }
    const _id = window.localStorage.getItem("surveyId");

    try {
      const data = {
        survey: {
          id: _id,
        },
        type: "custom",
        question: Title.current.value,
      };
      const res = await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/survey/64557ac5591d468fef3908ee/questions`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(res.data);
      Title.current.value = "";
      toast.success("Question added successfully");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <CustomInputAddContainer>
      <h2>
        Question :
        <span>
          {" "}
          <CustomInputQuestionContainer ref={Title} />
        </span>
      </h2>
      <button type="submit" onClick={handleSubmit}>
        Save
      </button>
      <ToastContainer />
    </CustomInputAddContainer>
  );
};
