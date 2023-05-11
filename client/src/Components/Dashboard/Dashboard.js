import React, { useEffect, useState } from 'react'
import { DashboardContainer } from '../../Styles/dashboard.styled'
import SurveyTile from '../Survey/Tile/SurveyTile'
import axios from 'axios'
import {MdWavingHand} from 'react-icons/md'

const Dashboard = () => {
  
  const [surveys, setSurveys] = useState([]);
  let user_state = null;

  let owner_id = null;
  useEffect((ownerID) => {
    const fetchSurveys = async () => {
      user_state = window.localStorage.getItem('_auth_state')?window.localStorage.getItem('_auth_state'):'6426cb196f3bb0a8d860bb23'
      owner_id = JSON.parse(user_state).user_id?JSON.parse(user_state).user_id:'6426cb196f3bb0a8d860bb23';

      const res = await axios.get(`http://localhost:4949/api/v1/survey`, {
          params: {owner_id:owner_id}
          },
          { headers: {
                'Content-Type': 'application/json'
              }
            })
            setSurveys(res.data.surveys)
    }

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
          <h1 style={{fontWeight:'normal'}}>Welcome <MdWavingHand/> </h1>

          <h2>Your Surveys</h2>
          {surveys.length===0 && <h3>You have no surveys yet. Click on the <b style={{padding:'5px',backgroundColor:'black',borderRadius:'5px' }}>Create</b> button to create a new survey.</h3> }
          {surveys.map((survey) => <SurveyTile Title={survey.title} Date={handleDate(survey.createdAt)} survey_id={survey._id}/>) }
        </DashboardContainer>
    </>
  )
}

export default Dashboard