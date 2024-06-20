import React, { useEffect,useState } from 'react'

import axios from 'axios'
import { useParams } from 'react-router-dom'
import { ViewSurveyContainer } from './viewsurvey.styled'
import { YesNoSurvey } from '../../Components/YesNoSurvey/YesNoSurvey'
import {DropDownSurvey} from '../../Components/DropDownSurvey/DropDownSurvey'
import { CustomInput } from '../../Components/CustomInputSurvey/CustomInput'

const ViewSurvey = () => {
    
    const params = useParams()
    const survey_id = params.id

    const [survey, setSurvey] = useState();
    const [questions, setQuestions] = useState();
    useEffect(() => {
    const fetchSurvey = async () => {
        const res = await axios.get(`${process.env.API_ADDRESS}/survey/${params.id}`, {
            params: {survey_id}
            },
            { headers: {
                  'Content-Type': 'application/json'
                }
              })
        setSurvey(res.data.survey)
        setQuestions(res.data.questions)
        console.log(res.data.survey)
        console.log(res.data.questions)

      }
      fetchSurvey()
}, [params.id,survey_id])
  return (
    <ViewSurveyContainer>
    <h1>{survey?.title}</h1>
    {questions?.map((question,index) => {
        if(question.type==='yes/no'){
            return <YesNoSurvey questionNo={index} question={question.question} options={question.options} _id={question._id}/>
        }else if(question.type ==='dropdown'){
            return <DropDownSurvey questionNo={index} question={question.question} options={question.options} _id={question._id}/>
        }
        else return <CustomInput questionNo={index} question={question.question} _id={question._id}/>
    })}
    </ViewSurveyContainer>
   
  )
}

export default ViewSurvey