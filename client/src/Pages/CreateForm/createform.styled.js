import styled from "styled-components";

export const CreateFormContainer = styled.div`
    height:100vh;
    width: 82vw;
    background-color: rgba(112,43,208,255);
    color:white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-left: 5%;
    button{
        border-radius: 5px;
        text-decoration: none;
        margin-left: 100px;
    }
    form{
        background-color: rgba(149,109,204,255);
        width: 70%;
        margin-top: 30px;
        padding: 20px;
        border-radius: 10px;
    }
`
export const CreateFromTitle = styled.div`
    padding-left: 80px;
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
        border: 1px solid #3498db;
        padding-left: 10px;
        color: black;
        &:focus{
            outline: none;
        }

    }

`
export const CreateFormAddQuestion = styled.div`
    color:white;
    background-color: white;
`

export const CreateFormChooseSurvey = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    justify-content: center;
    width:100%;

    margin-top: 20px;
    select{        
        font-family: Outfit;
        font-size: 18px;
        color: black;
        letter-spacing: 1.5px;
    }

    option{
        color:white;
        background-color:  #020B19;
    }

    button{
        font-family: Outfit; 
        color: rgb(220,220,220);
        background-color: transparent;
        border-radius: 8px;
        font-size: 40px;
        border:none;
        font-weight: 500;
        height: 40px;
        cursor: pointer;
        text-align: center;
        vertical-align: middle;
        padding: 0;
        &:hover{
            background-color: rgba(1,1,1,1);

        }
    }    
`