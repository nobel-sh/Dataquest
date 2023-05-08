import React from 'react'
import { CustomInputContainer } from './custominput.styled'

export const CustomInput = ({questionNo,question}) => {
  return (
    <CustomInputContainer>
        suii
        <h3>Question <span>{questionNo+1}</span></h3>
        <h1>{question}</h1>
        <input type="text" />
    </CustomInputContainer>
  )
}
