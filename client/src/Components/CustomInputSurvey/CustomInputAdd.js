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
        <h2>
          Question:{" "}
          <CustomInputQuestionContainer
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </h2>
      </span>
    </CustomInputAddContainer>
  );
});
