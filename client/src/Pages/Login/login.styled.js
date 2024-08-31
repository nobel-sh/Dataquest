import styled from "styled-components";

export const LoginContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    width: 90vw;
    max-width: 500px; 
    border-radius: 10px;
    padding: 2rem;
    color: black;
    background-color: #f9f9f9;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-size: 1.5rem;

    img {
        width: 200px; 
        height: auto;
        margin-bottom: 2rem; 
    }

    input,
    button {
        width: 100%;
        max-width: 400px;
        height: 2.5rem;
        margin: 1rem 0;
        border-radius: 0.5rem;
        border: 1px solid #ddd;
        outline: none;
        padding: 0.5rem;
    }

    button {
        background-color: #1e90ff;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        border: none;
    }

    button:hover {
        background-color: white;
        color: #1e90ff;
        border: 1px solid #1e90ff;
    }

    h1 {
        font-size: 2rem;
        margin: 1rem;
        font-weight: 600;
    }

    h2 {
        font-size: 1.5rem;
        margin: 0;
    }

    h3 {
        font-size: 1rem;
        margin: 0;
        font-weight: 400;
    }

    span {
        font-size: 1.25rem;
        color: #1e90ff;
    }

    @media (max-width: 768px) {
        width: 90vw;
        padding: 1.5rem;
        
        h1 {
            font-size: 1.75rem;
        }
        
        h2 {
            font-size: 1.25rem;
        }

        h3 {
            font-size: 1rem;
        }

        span {
            font-size: 1rem;
        }
    }

    @media (max-width: 480px) {
        width: 95vw;
        padding: 1rem;
        
        h1 {
            font-size: 1.5rem;
        }
        
        h2 {
            font-size: 1rem;
        }

        h3 {
            font-size: 0.875rem;
        }

        span {
            font-size: 0.875rem;
        }

        input,
        button {
            width: 90%;
        }
    }
`;

export const LoginInputContainer = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; 
    width: 100%; 
`;

