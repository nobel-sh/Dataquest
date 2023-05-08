import React from 'react'
import { SurveyTileContainer, SurveyTileDottedlines, SurveyTileInfo, SurveyTileInfoText, SurveyTileOpenButton, SurveyTileTitle } from '../../../Styles/surveytile.styled'

const SurveyTile = ({Title,Date,survey_id}) => {
  const handleClick = () => {
    window.localStorage.setItem('surveyId',survey_id)
    window.location.href = `/forms/${survey_id}`
  }
  return (
    <>
        <SurveyTileContainer>
            <SurveyTileTitle>{Title}</SurveyTileTitle>
            <SurveyTileDottedlines/>
            <SurveyTileInfo>
                <SurveyTileInfoText>Created At : {Date} </SurveyTileInfoText>
                <SurveyTileOpenButton onClick={handleClick}>Open</SurveyTileOpenButton>
            </SurveyTileInfo>
            
        </SurveyTileContainer>
    </>
  )
}

export default SurveyTile