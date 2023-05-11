import styled from "styled-components";

export const DropDownContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius:10px;
    margin-top: 30px;
    color:white;
    background-color: #020B19;
    gap:20px;
    width: 76vw;
    padding: 20px;
    h1{
        margin: 10px;
        margin-top: 2px;
    }
    h3{
        margin: 0;
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
    select{
        font-family: Outfit;
        min-width: 5rem;
        border: none;
        border-radius: 2px;
        min-height: 1.5rem;
    }
`