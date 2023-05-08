import styled from "styled-components";

export const YesNoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius:10px;
    background-color: grey;
    margin-top: 30px;
    margin-right: 30px;
    padding: 10px;
    color:white;
    p{
        margin: 0;
    }
    h1{
        margin: 10px;
        margin-top: 0;
    }
    h3{
        margin: 0;
    }
`

export const YesNoOptionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 100px;
    
    button{
        height: 30px;
        width: 100px;
        background-color: #0D1117;
        color: white;
        border: none;
        border-radius: 5px;
    }

`