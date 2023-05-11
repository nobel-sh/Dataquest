import styled from "styled-components";

export const CustomInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color:white;
    background-color: #020B19;
    margin-top: 30px;
    border-radius: 5px;
    width: 76vw;
    padding: 20px;
    gap:20px;
    h3{
       margin: 0;
        span{
            font-size: 1.5rem;
            font-weight: 700;
        }
    }
    h1{
        margin: 10px;
        margin-top: 2px;
    }

    input{
        font-family: Outfit;
        width: 85%;
        min-height: 1.5rem;
        border-radius: 3px;
        border: none;
        outline: none;
        padding: 0.5rem;
        font-size: 1.2rem;
        font-weight: 500;
    }
    button{
        height: 30px;
        width: 100px;
        background-color: white;
        color: black;
        border: none;
        border-radius: 5px;
        margin:5px;
    }
`