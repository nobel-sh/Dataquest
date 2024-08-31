
import styled from "styled-components";

export const YesNoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius:10px;
    background-color: #f9f9f9;
    margin-top: 30px;
    padding: 10px;
    gap:10px;
    padding:20px;
    width: 60vw;
    border: 1px solid lightgray;
    h1{
        margin: 10px;
        margin-top: 2px;
        font-weight: 600;
    }
    h3{
        margin: 0;
        font-weight: 400;
    }
    button{
        height: 30px;
        width: 100px;
        background-color: lightgreen;
        color: black;
        border: none;
        border-radius: 5px;
    }
`

export const YesNoOptionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 200px;
    margin: 10px;

    button{
        height: 30px;
        width: 100px;
        background-color: white;
        color: black;
        border: none;
        border-radius: 5px;
           
    }
`