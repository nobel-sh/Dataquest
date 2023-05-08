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
        height: 40px;
        width:60px;
    }
`    
export const YesNoQuestionContainer = styled.input`
    border-radius: 5px;
    min-width: 50rem;
    height: 20px;
`
export const YesNoOptionsContainer = styled.div`
    display: flex;
    gap:200px;
    input{
        border-radius: 5px;
        margin-left: 10px;
        border: 0;
    }
`