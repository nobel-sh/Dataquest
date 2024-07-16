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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SurveyTile = ({ Title, Date, survey_id }) => {
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
      console.log(survey_id);
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
      console.log(res.data);
      toast.success("Survey Deleted");
      navigate(0);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };
  return (
    <>
      <SurveyTileContainer>
        <SurveyTileTitle>{Title}</SurveyTileTitle>
        <SurveyTileDottedlines />
        <SurveyTileInfo>
          <SurveyTileInfoText>Created At : {Date} </SurveyTileInfoText>
          <SurveyTileOpenButton onClick={handleClick}>
            Open
          </SurveyTileOpenButton>
          <SurveyTileOpenButton
            style={{ backgroundColor: "#aa0000", color: "white" }}
            onClick={handleDelete}
          >
            Delete
          </SurveyTileOpenButton>
        </SurveyTileInfo>
        <LinkContainer>
          <h3>Link: </h3>
          <a
            onClick={handleClipboard}
          >{`http://localhost:3000/forms/${survey_id}`}</a>
        </LinkContainer>
      </SurveyTileContainer>
      {/* <ToastContainer /> */}
    </>
  );
};

export default SurveyTile;
