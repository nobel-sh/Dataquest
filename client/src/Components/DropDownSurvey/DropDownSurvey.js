import React from 'react'
import { DropDownContainer } from './dropdownsurvey.styled'

export const DropDownSurvey = ({questionNo,question,options}) => {
  return (
    <DropDownContainer>
      <h3>Question <span>{questionNo+1}</span></h3>
      <h1>{question}</h1>
      <select> 
        {options.map((option,index) => {
          return <option key={index} value={option}>{option}</option>
        })}
      </select>
    </DropDownContainer>
  )
}
    