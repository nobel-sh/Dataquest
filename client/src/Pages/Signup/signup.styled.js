import styled from "styled-components";

export const SignupContainer = styled.div`
    display: flex;
    background-color: aliceblue;
    color:black;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: auto;
    width: 50vw;
    border-radius: 20px;
    margin:40px;
    margin-left:25vw !important;
    font-size: 1.5rem;
    color:white;
    margin-left: 10vw;
`

export const SignupInputContainer = styled.form`
    color:black;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    label{
        margin:5px;
    }
    input{
        width: 20rem;
        height: 2rem;
        margin: 1rem;
        border-radius: 0.5rem;
        border: none;
        outline: none;
        padding: 0.5rem;
    }
    button{
        width: 10rem;
        height: 2rem;
        margin: 1rem;
        border-radius: 0.5rem;
        border: none;
        outline: none;
        padding: 0.5rem;
        background-color: #1e90ff;
        color: white;
        font-size: 1rem;
        cursor: pointer;
    }
    button:hover{
        background-color: white;
        color:grey;
    }
    h2{
        font-size: larger;
        margin:2px;
    }
`