import React, { useEffect,useState } from 'react'
import { ResultsContainer } from './results.styled'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import ApexCharts from 'apexcharts'
import Chart from 'react-apexcharts'
import { giveNoOfResults, giveNoOfResultsForYesNo } from './ResultStats'

const Results = () => {

    const survey_id = useParams().id;
    const [title,setTitle] = useState('');
    const [questions,setQuestions] = useState([]);
    const [responses,setResponses] = useState([]);

  
    useEffect(() => {
    
        const fetchResults = async () => {
            const res = await axios.get(`http://localhost:4949/api/v1/survey/${survey_id}/responses`,
            {
                params:{
                    survey_id
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            );
            setTitle(res.data.survey.title);
            setQuestions(res.data.questions);
            setResponses(res.data.responses);
        }
        
        fetchResults();
    }, [])

    const generateStats = (question) => {
                const value = []
                const results = giveNoOfResultsForYesNo(question,responses);
                question.options.map((option) => {
                    value.push(results[option.toString()]?results[option.toString()]:0)
                    console.log(option)
                })
                // console.log(value)
                const options = {
                    chart: {
                        type: 'bar'
                    },
                    series: [
                        {
                            name: 'Choice',
                            data: value
                        }
                    ],
                    xaxis: {
                        categories: question.options
                    }
                }
                return options;
    }
    

        const options = {
            chart: {
              type: 'bar'
            },
            series: [
              {
                name: 'suii',
                data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
              }
            ],
            xaxis: {
              categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
            }
          }
       

    return (
    <ResultsContainer>
        <h1>{title}</h1>
        <div>
            <h2>Responses received : {responses.length/questions.length}</h2>
            <Chart options={options} series={options.series} type={options.chart.type} width={500} height={320} />
        </div> 
        {questions.map((question) => {
            const options = generateStats(question);
            // console.log(options)
            return <Chart options={options} series={options.series} type={options.chart.type} width={500} height={320} />   
        })  }
          
        </ResultsContainer>
  )
}

export default Results