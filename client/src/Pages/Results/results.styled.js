import styled from "styled-components";

export const ResultsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    h1{
        font-weight: 600;
    }
    h3{
        font-weight: 400;
    }
    h2{
        font-weight: 500;
        font-size: 1.2rem;
    }


`
export const ResponseContainer = styled.div`
    padding: 20px;
    padding-left: 50px;
    background-color: #f9f9f9;
    width: 60%;
    border-radius: 2px;
    margin: 8px; 
    margin-top: 16px;
    border : 1px solid lightgray;
    h1{
        text-align: center;
        font-weight: 600;
    }
    h2{
        font-weight: 500;
    }
    h3{
        font-weight: 400;
        font-size: 1rem;
        padding: 1em; 
        border:1px solid gray; 
    }
`
export const ChartsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly !important;
`