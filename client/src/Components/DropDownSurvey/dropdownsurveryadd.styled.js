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
        height: 40px;
        width:60px;
    }
`  
export const DropDownQuestionContainer = styled.input`
    border-radius: 5px;
    min-width: 50rem;
    height: 20px;
`

export const DropDownAnswersContainer = styled.input`
    border-radius: 5px;
    width: 20rem;
    height: 20px;
`
