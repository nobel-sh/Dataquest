import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  CustomInputAddContainer,
  CustomInputQuestionContainer,
} from "./custominputadd.styled";

export const CustomInputAdd = forwardRef((props, ref) => {
  const [title, setTitle] = useState("");

  useImperativeHandle(ref, () => ({
    getData: () => {
      if (title.trim() === "") {
        throw new Error("Please enter a question");
      }
      return {
        type: "custom",
        question: title,
      };
    },
  }));

  return (
    <CustomInputAddContainer>
      <span>
          <CustomInputQuestionContainer
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your question here"
          />
      </span>
    </CustomInputAddContainer>
  );
});
