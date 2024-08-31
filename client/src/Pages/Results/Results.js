import React, { useEffect, useState } from "react";
import {
  ResultsContainer,
  ChartsContainer,
  ResponseContainer,
} from "./results.styled";
import axios from "axios";
import { useParams } from "react-router-dom";
import Chart from "react-apexcharts";
import { giveNoOfResultsForYesNo } from "./ResultStats";
import { ToastContainer, toast } from "react-toastify";

const Results = () => {
  const survey_id = useParams().id;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
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
          `${process.env.REACT_APP_API_ADDRESS}/survey/${survey_id}/responses`,
          {
            params: {
              survey_id,
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth_token}`,
            },
          },
        );
        setTitle(res.data.survey.title);
        if (res.data.survey.description) {
          setDescription(res.data.survey.description);
        }
        setQuestions(res.data.questions);
        setResponses(res.data.responses);
      } catch (error) {
        console.error("Error fetching survey:", error);
        toast.error("Failed to fetch survey.");
      }
    };

    fetchResults();
  }, [survey_id]);

  const generateStats = (question) => {
    const value = [];
    const results = giveNoOfResultsForYesNo(question, responses);
    question.options.map((option) =>
      value.push(results.get(option) ? results.get(option) : 0),
    );
    return value;
  };
  const generateBar = (question) => {
    const value = generateStats(question);
    const options = {
      colors: ["#00e396", "#008ffb", "#ff4560", "#feb019", "#9d6a79"],
      plotOptions: {
        bar: {
          distributed: true,
        },
      },
      chart: {
        foreColor: "#000",
        type: "bar",
      },
      series: [
        {
          name: "Option",
          data: value,
        },
      ],
      xaxis: {
        categories: question.options,
      },
    };
    return options;
  };

  const generateDonut = (question) => {
    const value = generateStats(question);
    const options = {
      series: value,
      options: {
        labels: question.options,
        chart: {
          foreColor: "#000",

          type: "donut",
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    };
    return options;
  };

  const generateCustom = (question) => {
    const results = [];
    responses.forEach((response) => {
      if (response.question_id === question._id) {
        results.push(response.answer);
      }
    });
    return results;
  };

  return (
    <>
      <ResultsContainer>
        <h1>{title}</h1>
        <h3>{description}</h3>
        <h2>
            Response(s) : [{""}
            {responses.length ? responses.length / questions.length : 0}]
        </h2>
        {questions.map((question) => {
          const bar_options = generateBar(question);
          const donut_options = generateDonut(question);

          return (
            <ResponseContainer key={question._id}>
              <h1>{question.question}</h1>
              <h2
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                responses
              </h2>
              {question.type !== "custom" ? (
                <ChartsContainer>
                  <Chart
                    options={bar_options}
                    series={bar_options.series}
                    type={bar_options.chart.type}
                    width={300}
                    height={200}
                  />
                  <Chart
                    options={donut_options.options}
                    series={donut_options.series}
                    type="donut"
                    width={300}
                    height={200}
                  />
                </ChartsContainer>
              ) : (
                <>
                  {generateCustom(question).map((answer) => (
                    <h3>{answer}</h3>
                  ))}
                </>
              )}
            </ResponseContainer>
          );
        })}
      </ResultsContainer>
      <ToastContainer />
    </>
  );
};

export default Results;
