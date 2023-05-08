import React, { useRef } from 'react'
import {  CustomInputAddContainer, CustomInputQuestionContainer } from './custominputadd.styled'
import axios from 'axios';


export const CustomInputAdd = () => {
    const Title = useRef(null);
    const handleSubmit = async () => {

        if(Title.current.value === ''){
            alert('Please fill all the fields')
            return;
        }

        if(window.localStorage.getItem('surveyId')==null){
            alert('Please add title first')
            return;
        }
        const _id = window.localStorage.getItem('surveyId')
        
        const data = {
            survey:{
                id:_id,
            },
            type:'custom',
            question:Title.current.value,
        }
        const res  = await axios.post('http://localhost:4949/api/v1/survey/64557ac5591d468fef3908ee/questions',data,{
            headers: {
              'Content-Type': 'application/json'
            }})
        console.log(res.data)
        Title.current.value = ''  
    }
    
    return (
        <CustomInputAddContainer>
        <span><h2>Question :</h2> <CustomInputQuestionContainer ref={Title}/></span>
        <button type='submit' onClick={handleSubmit}>Save</button>
        </CustomInputAddContainer>
    )
}
