import styled from "styled-components";

export const SurveyTileContainer = styled.div`
    display:flex;
    flex-direction: column;
    background-color: rgba(149,109,204,255);
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
    display: flex !important;
    justify-content: space-around !important;
    gap:10vw;
    align-items: center;
    padding:0;
`
export const SurveyTileInfoText = styled.h3`
    font-weight: 400;
`
export const SurveyTileOpenButton = styled.button`
    color: black;
    background-color: white;
    border-radius: 10px;
    height: 2rem;
    min-width: 6rem;
    font-size: larger;
    border: none;
    font-weight: 600;
    &:hover{
        background-color: rgba(255,255,255,0.8);
    }
`
export const LinkContainer = styled.div`
    padding: 2px;
    display:flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 20px;
    h3{
        margin:0;
    }
    a{
        text-decoration: underline;
    }
    &:hover{
        cursor: pointer;
        color: rgb(230,230,230);
    }
`