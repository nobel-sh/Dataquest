import React from 'react'
import { YesNoContainer,YesNoOptionsContainer } from './yesnosurvey.styled'

export const YesNoSurvey = ({questionNo,question,options}) => {
  return (
    <YesNoContainer>
        <h3>Question <span>{questionNo+1}</span></h3>
        <h1>{question}</h1>
        <YesNoOptionsContainer>
            <button>{options[0]}</button>
            <button>{options[1]}</button>
        </YesNoOptionsContainer>
        
    </YesNoContainer> 
    
  )
}
