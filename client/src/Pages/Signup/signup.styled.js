import styled from "styled-components";

export const SignupContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90vw;
    max-width: 500px;
    border-radius: 10px;
    padding: 2rem;
    background-color: #f9f9f9;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-size: 1.5rem;

    img {
        width: 200px;
        height: auto;
        margin-bottom: 2rem;
    }

    h1 {
        font-size: 2rem;
        margin: 1rem; 
        font-weight: 600;
    }

    label {
        margin: 0.5rem 0;
        color: black;
    }

    input,
    button {
        width: 100%;
        max-width: 400px;
        height: 2.5rem;
        margin: 0.5rem 0;
        border-radius: 0.5rem;
        border: 1px solid #ddd;
        outline: none;
        padding: 0.5rem;
    }

    input {
        background-color: white;
    }

    button {
        background-color: #1e90ff;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        border: none;
        margin-top: 1rem;
    }

    button:hover {
        background-color: white;
        color: #1e90ff;
        border: 1px solid #1e90ff;
    }

    @media (max-width: 768px) {
        width: 90vw;
        padding: 1.5rem;

        h1 {
            font-size: 1.75rem;
        }
    }

    @media (max-width: 480px) {
        width: 95vw;
        padding: 1rem;

        h1 {
            font-size: 1.5rem;
        }
    }
`;

