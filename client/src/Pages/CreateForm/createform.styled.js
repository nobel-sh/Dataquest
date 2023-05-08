import styled from "styled-components";

export const CreateFormContainer = styled.div`
    min-height: 90vh;
    width: 82vw;
    background-color: black;
    color:white;
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    padding-left: 5%;
    button{
        border-radius: 5px;
        text-decoration: none;
        margin-left: 100px;
    }
`
export const CreateFromTitle = styled.div`
    padding-left: 80px;
    padding-top: 70px;
    display: flex;
    gap:60px;

    h1{
        font-size: x-large;
        font-weight: 500;
        letter-spacing: 1.2px;
        
    }
    input{
        margin: 0;
        border: 0;
        min-width: 600px;
        height: 35px;
        border-radius: 5px;
    }

`
export const CreateFormAddQuestion = styled.div`
    color:white;
    background-color: black;
`

export const CreateFormChooseSurvey = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    justify-content: center;
    select{
        min-height: 25px;
        width:auto;
        border-radius: 5px;
        border: 1px solid #3498db;
        background-color: transparent;
        color:white;   
    }

    option{
            /* background-color:transparent; */
            color:black;
        }

    button{

        min-height: 25px;
        width: max-content;
        border-radius: 5px;
        box-shadow: 0 6px 6px rgba(0, 0, 0, 0.6);
        border: 1px solid #3498db;
        background-color: transparent;
        color:white;

    }    
`