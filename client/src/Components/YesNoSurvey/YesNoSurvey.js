import React, { useState } from 'react'
import { YesNoContainer,YesNoOptionsContainer } from './yesnosurvey.styled'
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const YesNoSurvey = ({questionNo,question,options,_id}) => {
  const [selected,setSelected] = useState(null);
  const survey_id = useParams().id;
  const user_id = localStorage.getItem('user_id')?localStorage.getItem('user_id'):'6426cb196f3bb0a8d860bb23';

  const handleClick = async (e) => {
    if(selected===null){
      alert('Please select an option')
      return;
    }
    const data = {
      survey:{
          id:survey_id,
      },
      question:{
        id:_id,
      },
      answer:selected,
      respondent:{
        id:user_id,
      }
    }
    const res = await axios.post(`http://localhost:4949/api/v1/survey/${survey_id}/responses`,data,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(res.data)
  }
  return (
    <YesNoContainer>
        <h3>Question <span>{questionNo+1}</span></h3>
        <h1>{question}</h1>
        <YesNoOptionsContainer>
            <button onClick={()=>{setSelected(options[0])}} > {options[0]}</button>
            <button onClick={()=>{setSelected(options[1])}} > {options[1]}</button>
        </YesNoOptionsContainer>
        <button onClick={handleClick}>Save</button>
        
    </YesNoContainer> 
    
  )
}
