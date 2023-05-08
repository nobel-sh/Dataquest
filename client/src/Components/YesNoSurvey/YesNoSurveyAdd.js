import React from 'react'
import { YesNoAddContainer,YesNoOptionsContainer,YesNoQuestionContainer } from './yesnosurveyadd.styled'
import { useRef } from 'react'
import axios from 'axios';

export const YesNoSurveyAdd = () => {
    const Option1 = useRef(null);
    const Option2 = useRef(null);
    const Title = useRef(null);

    const handleClick = async (e) => {

      if(Title.current.value === '' || Option1.current.value === '' || Option2.current.value === ''){
        alert('Please fill all the fields')
        return;
      }
    
      if(Option1.current.value === Option2.current.value){
        alert('Options cannot be same')
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
          type:'yes/no',
          question:Title.current.value,
          options:[Option1.current.value,Option2.current.value]
      }
        await axios.post('http://localhost:4949/api/v1/survey/64557ac5591d468fef3908ee/questions',data,{
          headers: {
            'Content-Type': 'application/json'
          }})
      Title.current.value = ''
      Option1.current.value = ''
      Option2.current.value = ''
        
    };
    
    

  return (
    <YesNoAddContainer>
            <label>Title : <YesNoQuestionContainer type='text' name='question' ref={Title}></YesNoQuestionContainer></label> 

            <YesNoOptionsContainer>

                    <span>Option 1 :<input ref={Option1} type='text' name='option-1'/></span>
                    <span>Option 2 :<input ref={Option2} type='text' name='option-2'/></span>

            </YesNoOptionsContainer> 
            
            <button type='submit' onClick={handleClick}>Save</button>          
    </YesNoAddContainer>
  )
}

