import React, { useEffect, useState } from "react";
import { DashboardContainer } from "../../Styles/dashboard.styled";
import SurveyTile from "../Survey/Tile/SurveyTile";
import axios from "axios";
import { MdWavingHand } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      const user_state = window.localStorage.getItem("_auth_state");
      const auth_token = window.localStorage.getItem("_auth");

      if (!user_state) {
        toast.error("Please log in.");
        return;
      }

      const owner_id = JSON.parse(user_state).user_id;

      if (!owner_id || !auth_token) {
        toast.error("Please log in.");
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_ADDRESS}/survey`,
          {
            params: { owner_id: owner_id },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth_token}`,
            },
          },
        );
        setSurveys(res.data.surveys);
      } catch (error) {
        console.error("Error fetching surveys:", error);
        toast.error("Failed to fetch surveys.");
      }
    };

    fetchSurveys();
  }, []);

  const handleDate = (survey_date) => {
    const parsed_date = new Date(survey_date);
    const date =
      parsed_date.getFullYear() +
      "/" +
      (parsed_date.getMonth() + 1) +
      "/" +
      parsed_date.getDate();
    return date;
  };

  return (
    <>
      <DashboardContainer>
        <h1 style={{ fontWeight: "normal" }}>
          Welcome <MdWavingHand />{" "}
        </h1>

        <h2>Your Surveys</h2>
        {surveys.length === 0 && (
          <h3>
            You have no surveys yet. Click on the{" "}
            <b
              style={{
                padding: "5px",
                backgroundColor: "black",
                color: "white",
                borderRadius: "5px",
              }}
            >
              Create
            </b>{" "}
            button to create a new survey.
          </h3>
        )}

        {surveys.map((survey) => (
          <SurveyTile
            key={survey._id}
            Title={survey.title}
            Description={survey.description}
            Date={handleDate(survey.createdAt)}
            survey_id={survey._id}
          />
        ))}
      </DashboardContainer>
      <ToastContainer />
    </>
  );
};

export default Dashboard;
