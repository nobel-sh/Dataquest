import React, { useEffect, useState } from 'react'
import { DashboardContainer } from '../../Styles/dashboard.styled'
import SurveyTile from '../Survey/Tile/SurveyTile'
import axios from 'axios'

const owner_id = '6426cb196f3bb0a8d860bb23'

const Dashboard = () => {

  const [surveys, setSurveys] = useState([]);

  useEffect((ownerID) => {
    const fetchSurveys = async () => {
      const res = await axios.get(`http://localhost:4949/api/v1/survey`, {
          params: {owner_id}
          },
          { headers: {
                'Content-Type': 'application/json'
              }
            })
      setSurveys(res.data.surveys)
      console.log(res.data)
    }
    // const reload_window = ()=>{window.location.reload()}
    fetchSurveys()
    // reload_window()
  }, [])

  const handleDate = (survey_date) => {
    const parsed_date = new Date(survey_date)
    const date = parsed_date.getFullYear() + '/' + (parsed_date.getMonth()+1) + '/' + parsed_date.getDate();
    return date
  }

  return (
    <>  
        <DashboardContainer>
            {surveys.map((survey) => <SurveyTile Title={survey.title} Date={handleDate(survey.createdAt)} survey_id={survey._id}/>) }
        </DashboardContainer>
    </>
  )
}

export default Dashboard