import styled from "styled-components";
import { Link } from "react-router-dom";

export const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width:18vw;
    height: auto;
    background-color: #0D1117;
    color:white;
    gap: 20px;
    padding-top: 10vh;
`
export const SidebarText = styled.h2`
    font-size:1.5rem;
    margin: 1rem 1.5rem 1rem 1rem ;
    font-weight: 500;
`
export const SidebarLink = styled(Link)`
    text-decoration: none;
    color:white;
    font-size: x-large;
    padding-top: 1rem;
    &:focus{
    color: white;
    }
    &:active{
    color: black;
    };
`