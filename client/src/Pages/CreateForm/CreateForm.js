import React from 'react'
import {  CreateFormContainer, CreateFromTitle,CreateFormChooseSurvey } from './createform.styled'
import { useState } from 'react'
import {YesNoSurveyAdd} from '../../Components/YesNoSurvey/YesNoSurveyAdd'
import { DropDownSurveyAdd } from '../../Components/DropDownSurvey/DropDownSurveyAdd'
import { CustomInputAdd } from '../../Components/CustomInputSurvey/CustomInputAdd'
import axios from 'axios'


const CreateForm = () => {

  const [dropDownValue,setDropDownValue] = useState('yes/no')
  const [questions,setQuestions] = useState(<YesNoSurveyAdd/>)

  const handleDropDownChange = (e) => {
    setDropDownValue(e.target.value)
    console.log(e.target.value)
  }

  const handleAddSurvey = () => {
    setQuestions(<h1>Loadin</h1>)
    console.log(dropDownValue)
    if (dropDownValue === 'yes/no') {
        setQuestions(<YesNoSurveyAdd/>)
        return;
    }else if(dropDownValue === 'dropdown'){
      setQuestions(<DropDownSurveyAdd/>)
      return;
    }
    else{
      setQuestions(<CustomInputAdd/>)
    }
  } 


  const handleTitle = async (e) => {
    console.log(e.target.value)
    const data = {
      owner:{
        id:'6426cb196f3bb0a8d860bb23'
    },
    title:e.target.value
  }

  const res  = await axios.post('http://localhost:4949/api/v1/survey',data,{
    headers: {
      'Content-Type': 'application/json'
    }});
  console.log(res.data)
  if(res.status === 200){
    alert('Title Added')
    window.localStorage.setItem('surveyId',res.data._id)
  }
  else if(res.status === 400){
    alert('Title already exists')
    return
  }else{
    alert('Something went wrong')
  }
}

  return (

    <CreateFormContainer>

        <form>
        <CreateFromTitle><h1>Title : <input type='text' name='title' onBlur={handleTitle}/></h1></CreateFromTitle>
        </form>

          <CreateFormChooseSurvey>
            <h2>Survey Type : </h2>
            <select value={dropDownValue} onChange={handleDropDownChange}>         
              <option value="yes/no">Yes/No</option>
              <option value="dropdown">Drop-Down</option>
              <option value="custom">Custom Input</option>
            </select>
          <button onClick={handleAddSurvey}>Add Question</button>
          </CreateFormChooseSurvey>

          {questions}
        


    </CreateFormContainer>
      )
}

export default CreateForm