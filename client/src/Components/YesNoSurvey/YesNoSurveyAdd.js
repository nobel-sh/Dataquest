import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  YesNoAddContainer,
  YesNoOptionsContainer,
  YesNoQuestionContainer,
} from "./yesnosurveyadd.styled";

export const YesNoSurveyAdd = forwardRef((props, ref) => {
  const [title, setTitle] = useState("");
  const [option1, setOption1] = useState("Option 1");
  const [option2, setOption2] = useState("Option 2");

  useImperativeHandle(ref, () => ({
    getData: () => {
      if (title === "" || option1 === "" || option2 === "") {
        throw new Error("Please fill all the fields");
      }
      if (option1 === option2) {
        throw new Error("Options cannot be the same");
      }
      return {
        type: "yes/no",
        question: title,
        options: [option1, option2],
      };
    },
  }));

  return (
    <YesNoAddContainer>
        <YesNoQuestionContainer
          type="text"
          name="question"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your question"
        />
      <YesNoOptionsContainer>
        <input
          type="text"
          name="option-1"
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
        />
        <input
          type="text"
          name="option-2"
          value={option2}
          onChange={(e) => setOption2(e.target.value)}
        />
      </YesNoOptionsContainer>
    </YesNoAddContainer>
  );
});
