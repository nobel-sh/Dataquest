import React from "react";
import {
  SurveyTileContainer,
  SurveyTileDottedlines,
  SurveyTileInfo,
  SurveyTileInfoText,
  SurveyTileOpenButton,
  SurveyTileTitle,
  LinkContainer,
} from "../../../Styles/surveytile.styled";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdCalendarMonth } from "react-icons/md";

const SurveyTile = ({ Title, Date, survey_id, Description }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    window.localStorage.setItem("surveyId", survey_id);
    window.location.href = `/results/${survey_id}`;
  };

  const handleClipboard = () => {
    navigator.clipboard.writeText(`http://localhost:3000/forms/${survey_id}`);
    toast.success("Copied To Clipboard!", {
      position: "bottom-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const handleDelete = async () => {
    const auth_token = window.localStorage.getItem("_auth");
    if (!auth_token) {
      toast.error("Please log in.");
      return;
    }
    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_ADDRESS}/survey/${survey_id}`,
        {
          params: { survey_id },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );
      toast.success("Survey Deleted");
      navigate(0);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <SurveyTileContainer>
      <SurveyTileTitle>{Title}</SurveyTileTitle>
      <h3>{Description}</h3>
      <SurveyTileDottedlines />
      <SurveyTileInfo>
        <SurveyTileInfoText>
          <MdCalendarMonth style={{ marginRight: '12px' }} /> 
          {Date}
          </SurveyTileInfoText>
        <SurveyTileOpenButton onClick={handleClick}>Open</SurveyTileOpenButton>
        <SurveyTileOpenButton
          style={{ backgroundColor: "#d9534f"}}
          onClick={handleDelete}
        >
          Delete
        </SurveyTileOpenButton>
      </SurveyTileInfo>
      <LinkContainer>
        <span>
          <b>Link: </b>
          <a onClick={handleClipboard}>
            {`http://localhost:3000/forms/${survey_id}`}
          </a>
        </span>
      </LinkContainer>
    </SurveyTileContainer>
  );
};

export default SurveyTile;

