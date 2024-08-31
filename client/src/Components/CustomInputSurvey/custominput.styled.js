import styled from "styled-components";

export const CustomInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9; 
    margin-top: 30px;
    border-radius: 5px;
    width: 60vw;
    padding: 20px;
    gap:20px;
    h3{
       font-weight: 400; 
    }
    h1{
        font-weight: 600;
    }

    input{
        width: 80%;
        min-height: 1rem;
        border-radius: 2px;
        padding: 1rem;
        font-size: 1.2rem;
        font-weight: 500;
        border: 1px solid lightgray;
    }
    button{
        height: 40px;
        width: 80px;
        border-radius: 5px;
        border: none;
        margin:5px;
        background-color: lightgreen; 
    }
`