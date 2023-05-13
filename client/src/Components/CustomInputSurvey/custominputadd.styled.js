import styled from "styled-components"

export const CustomInputAddContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap:20px;
    margin:20px;
    margin-right: 2rem;
    padding: 2rem;
    background-color: #808cba;
    border-radius: 5px;

    h2{
        font-weight: 500;
    }
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

export const CustomInputQuestionContainer = styled.input`
    border-radius: 5px;
    min-width: 45rem;
    height: 30px;
    padding: 5px;

`
