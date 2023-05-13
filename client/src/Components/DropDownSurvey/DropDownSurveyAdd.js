import React, { useRef, useState } from 'react'
import { DropDownAddContainer, DropDownAnswersContainer, DropDownQuestionContainer } from './dropdownsurveryadd.styled'
import axios from 'axios';
import {toast,ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


export const DropDownSurveyAdd = () => {

    const Title = useRef(null);

    const DropDownOption = ({option_no}) => {
        return <span>Option  : {option_no} <DropDownAnswersContainer onBlur={handleSave} /></span>
    }
    const [options,setOptions] = useState([])
    const [optionsTile,setOptionsTile] = useState([<DropDownOption option_no='1'/>])

    const handleSave = (e) => {
        setOptions([...options,e.target.value])    
    }   
    
    const handleClick = (e) => {
        if(options.length<=0 || options[options.length-1]===''){
            return
        }
        setOptionsTile([...optionsTile,<DropDownOption option_no={optionsTile.length+1}/>])
        console.log(`New Option : ${options[options.length-1]}`)
    }


    
    const handleSubmit = async (e) => {
        
        if(window.localStorage.getItem('surveyId')==null){
            toast.error('Please add title first')
            return;
          }
        const _id = window.localStorage.getItem('surveyId')
        const data = {
          survey:{
              id:_id,
          },
          type:'dropdown',
          question:Title.current.value,
          options:options
      }

      try{
        const res  = await axios.post('http://localhost:4949/api/v1/survey/64557ac5591d468fef3908ee/questions',data,{
            headers: {
              'Content-Type': 'application/json'
            }})
        console.log(res.data)
      
            Title.current.value = ''
              setOptions([])
              setOptionsTile([<DropDownOption option_no='1'/>])
              toast.success('Question added successfully')
      }catch(err){
        console.log(err)
        toast.error('Something went wrong')
      }
     
    };

    return (
    <DropDownAddContainer>
        <span>Title: <DropDownQuestionContainer type='text' ref={Title}/></span>
        {optionsTile.map(option=>option)}
        <button onClick={handleClick}>Add </button>
        <button type='submit' onClick={handleSubmit}>Save</button>
    </DropDownAddContainer>
  )
}
