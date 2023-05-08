import styled from "styled-components";

export const SurveyTileContainer = styled.div`
    display:flex;
    flex-direction: column;
    background-color: #716F6F;
    color: white;
    margin: 50px;
    padding: 15px;
    border-radius: 20px;
    align-items: center;

    width: 70vw;
`

export const SurveyTileTitle = styled.h1`
    font-size: x-large;
    font-weight: 500;
    letter-spacing: 1.5px;
`

export const SurveyTileDottedlines = styled.div`
    border-bottom: 2px dotted white;
    width:inherit;
`
export const SurveyTileInfo = styled.div`
    display: flex;
    justify-content: space-evenly;
    gap:20vw;
    align-items: center;
    padding:0;
`
export const SurveyTileInfoText = styled.h3`
    font-weight: 400;
`
export const SurveyTileOpenButton = styled.button`
    color: white;
    background-color: #0D1117;
    border-radius: 10px;
    height: 2rem;
    min-width: 5rem;
    border: none;
    font-weight: 600;
`