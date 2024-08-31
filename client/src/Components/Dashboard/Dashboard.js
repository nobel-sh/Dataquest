import React, { useEffect, useState } from "react";
import { DashboardContainer, Message, SubHeading, Heading, SurveyTileGrid} from "../../Styles/dashboard.styled";
import SurveyTile from "../Survey/Tile/SurveyTile";
import axios from "axios";
import { MdWavingHand } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";

const SurveyTileContainer = ({ surveys }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()}`;
  };

  return (
    <SurveyTileGrid>
      {surveys.map(({ _id, title, description, createdAt }) => (
        <SurveyTile
          key={_id}
          Title={title}
          Description={description}
          Date={formatDate(createdAt)}
          survey_id={_id}
        />
      ))}
    </SurveyTileGrid>
  );
};

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      const userState = window.localStorage.getItem("_auth_state");
      const authToken = window.localStorage.getItem("_auth");

      if (!userState || !authToken) {
        toast.error("Please log in.");
        return;
      }

      const { user_id: ownerId } = JSON.parse(userState);

      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_ADDRESS}/survey`,
          {
            params: { owner_id: ownerId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setSurveys(data.surveys);
      } catch (error) {
        console.error("Error fetching surveys:", error);
        toast.error("Failed to fetch surveys.");
      }
    };

    fetchSurveys();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <>
      <DashboardContainer>
        <Heading>
          Welcome <MdWavingHand />
        </Heading>
        <SubHeading>Your Surveys</SubHeading>
        {surveys.length === 0 ? (
          <Message>
            <p>
            You have no surveys yet.<br/>
            Click on the{" "}
            <b><u>Create</u></b> button to create a new survey.
            </p>
          </Message>
        ) : (
          <SurveyTileContainer surveys={surveys} />
          // surveys.map(({ _id, title, description, createdAt }) => (
          //   <SurveyTile
          //     key={_id}
          //     Title={title}
          //     Description={description}
          //     Date={formatDate(createdAt)}
          //     survey_id={_id}
          //   />
          // ))
        )}
      </DashboardContainer>
      <ToastContainer />
    </>
  );
};

export default Dashboard;
