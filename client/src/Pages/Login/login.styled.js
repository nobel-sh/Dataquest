import styled from "styled-components";

export const LoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: aliceblue;
    color:black;
    height: 80vh;
    width: 50vw;
    border-radius: 20px;
    margin:80px;
    margin-left: 25vw;
    font-size: 1.5rem;
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
    h1{
        font-size: 3rem;
    }
    h2{
        font-size: 2rem;
    }
    h3{
        font-size: 1.5rem;
    }
    span{
        font-size: 1.5rem;
        color: #1e90ff;
    }

`

export const LoginInputContainer = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

`