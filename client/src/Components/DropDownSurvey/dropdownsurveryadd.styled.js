import styled from "styled-components"


export const DropDownAddContainer = styled.div`
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
    input{
        border-radius: 5px;
        margin-left: 10px;
        border: 0;
        height: 25px;
        width: 10rem;
        border-radius: 5px;
        height: 30px;
   }
`  
export const DropDownQuestionContainer = styled.input`
    min-width: 50rem;
    padding: 5px;
`

export const DropDownAnswersContainer = styled.input`
    height: 20px !important;
    width: 20rem;
   padding: 3px;
`
