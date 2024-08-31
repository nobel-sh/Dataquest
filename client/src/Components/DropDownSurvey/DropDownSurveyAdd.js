import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  DropDownAddContainer,
  DropDownAnswersContainer,
  DropDownQuestionContainer,
  DropDownButton,
} from "./dropdownsurveryadd.styled";

const DropDownOption = React.memo(({ value, onChange, onRemove, index }) => {
  return (
    <span>
      Option {index + 1}:
      <DropDownAnswersContainer
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
      />
      {index > 0 && (
        <DropDownButton onClick={() => onRemove(index)}>Remove</DropDownButton>
      )}
    </span>
  );
});

export const DropDownSurveyAdd = forwardRef((props, ref) => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState([{ id: Date.now(), value: "" }]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      if (title.trim() === "") {
        throw new Error("Please enter a question");
      }
      if (options.some((option) => option.value.trim() === "")) {
        throw new Error("Please fill all options");
      }
      return {
        type: "dropdown",
        question: title,
        options: options
          .map((opt) => opt.value)
          .filter((opt) => opt.trim() !== ""),
      };
    },
  }));

  const handleAddOption = () => {
    setOptions([...options, { id: Date.now(), value: "" }]);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = options.map((opt, i) =>
      i === index ? { ...opt, value } : opt,
    );
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <DropDownAddContainer>
        <DropDownQuestionContainer
          type="text"
          name="question"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your question"
        />
      {options.map((option, index) => (
        <DropDownOption
          key={option.id}
          value={option.value}
          onChange={handleOptionChange}
          onRemove={handleRemoveOption}
          index={index}
        />
      ))}
      <DropDownButton onClick={handleAddOption}>add</DropDownButton>
    </DropDownAddContainer>
  );
});
