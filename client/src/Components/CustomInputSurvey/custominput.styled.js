import styled from "styled-components";

export const CustomInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color:white;
    background-color: grey;
    margin-top: 1rem;
    border-radius: 5px;
    padding: 1rem;
    h3{
        font-size: 1.5rem;
        font-weight: 400;
        margin-bottom: 0.5rem;
        span{
            font-size: 1.5rem;
            font-weight: 700;
        }
    }
    input{
        width: 100%;
        height: 2rem;
        border-radius: 5px;
        border: none;
        outline: none;
        padding: 0.5rem;
        font-size: 1.2rem;
        font-weight: 500;
    }
    
`