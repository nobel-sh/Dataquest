import styled from "styled-components";

export const YesNoAddContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 1rem;
    padding: 1rem;
    align-items: center;
    gap:20px;
    margin-right: 2rem;
    border-radius: 10px;
    background-color: #020B19;
    button{
        font-family: Outfit;
        height: 40px;
        width:60px;
        border:none;
        font-size: larger;
        font-weight: 500;
        &:hover{
            background-color: rgb(230, 230,230, 0.5);
        }
    }
`    
export const YesNoQuestionContainer = styled.input`
    border-radius: 5px;
    min-width: 50rem;
    height: 30px;
    border: 0;
    margin-left: 10px;
    font-size: larger;
    font-weight: 500;

`
export const YesNoOptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    span{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
    }


    input{
        border-radius: 5px;
        margin-left: 10px;
        border: 0;
        height: 25px;
        width: 10rem;
   }
`