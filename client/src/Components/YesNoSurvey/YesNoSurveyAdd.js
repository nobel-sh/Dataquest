import React from "react";
import {
  YesNoAddContainer,
  YesNoOptionsContainer,
  YesNoQuestionContainer,
} from "./yesnosurveyadd.styled";
import { useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const YesNoSurveyAdd = () => {
  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Title = useRef(null);

  const handleClick = async (e) => {
    if (window.localStorage.getItem("surveyId") == null) {
      toast.error("Please add title first");
      return;
    }

    if (
      Title.current.value === "" ||
      Option1.current.value === "" ||
      Option2.current.value === ""
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    if (Option1.current.value === Option2.current.value) {
      toast.error("Options cannot be same");
      return;
    }

    const _id = window.localStorage.getItem("surveyId");

    const data = {
      survey: {
        id: _id,
      },
      type: "yes/no",
      question: Title.current.value,
      options: [Option1.current.value, Option2.current.value],
    };
    try {
      await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/survey/64557ac5591d468fef3908ee/questions`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      Title.current.value = "";
      Option1.current.value = "";
      Option2.current.value = "";
      toast.success("Question added successfully");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <YesNoAddContainer>
      <label>
        Title :{" "}
        <YesNoQuestionContainer
          type="text"
          name="question"
          ref={Title}
        ></YesNoQuestionContainer>
      </label>

      <YesNoOptionsContainer>
        <span>
          Option 1 :<input ref={Option1} type="text" name="option-1" />
        </span>
        <span>
          Option 2 :<input ref={Option2} type="text" name="option-2" />
        </span>
      </YesNoOptionsContainer>

      <button type="submit" onClick={handleClick}>
        Save
      </button>
    </YesNoAddContainer>
  );
};
