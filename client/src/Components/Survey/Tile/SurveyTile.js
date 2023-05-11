import React from 'react'
import { SurveyTileContainer, SurveyTileDottedlines, SurveyTileInfo, SurveyTileInfoText, SurveyTileOpenButton, SurveyTileTitle,LinkContainer} from '../../../Styles/surveytile.styled'
import Popup from 'reactjs-popup'

const SurveyTile = ({Title,Date,survey_id}) => {
  const handleClick = () => {
    window.localStorage.setItem('surveyId',survey_id)
    window.location.href = `/results/${survey_id}`
  }
  const handleClipboard = () => {
    navigator.clipboard.writeText(`http://localhost:4000/forms/${survey_id}`)
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
            <LinkContainer>
            <h3>Link: </h3>
            <Popup trigger={<a onClick={handleClipboard}>{`http://localhost:4000/forms/${survey_id}`}</a>} position="right center">
              <h3 style={{color:'#dddddd'}}>Copied to clipboard!</h3>
            </Popup>
            </LinkContainer>
        </SurveyTileContainer>
    </>
  )
}

export default SurveyTile