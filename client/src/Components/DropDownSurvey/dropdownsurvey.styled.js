import styled from "styled-components";

export const DropDownContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius:10px;
    margin-top: 30px;
    background-color: #f9f9f9;
    gap:20px;
    width: 60vw;
    padding: 20px;
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
        border: none;
        border-radius: 5px;
    }
    select{
        min-width: 10rem;
        border: none;
        border-radius: 2px;
        min-height: 2rem;
        padding: 0.5rem;
    }
`