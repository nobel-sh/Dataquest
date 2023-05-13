import styled from "styled-components";

export const ResultsContainer = styled.div`
    display: flex;
    background-color: gainsboro;
    color:black;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
`
export const ResponseContainer = styled.div`
    padding: 20px;
    padding-left: 50px;
    background-color: #808cba;
    width: 60%;
    margin: 30px;
    border-radius: 10px;
    h1{
        display: flex;
        justify-content: center;
        color:white;
    }
`
export const ChartsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly !important;
    color:black;
`