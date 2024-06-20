import React, { useEffect,useState } from 'react'
import { ResultsContainer,ChartsContainer,ResponseContainer } from './results.styled'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import Chart from 'react-apexcharts'
import {  giveNoOfResultsForYesNo } from './ResultStats'


const Results = () => {

    const survey_id = useParams().id;
    const [title,setTitle] = useState('');
    const [questions,setQuestions] = useState([]);
    const [responses,setResponses] = useState([]);

  
    useEffect(() => {
    
        const fetchResults = async () => {
            const res = await axios.get(`${process.env.API_ADDRESS}/survey/${survey_id}/responses`,
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
    }, [survey_id])

    const generateStats = (question) => {
        const value = []
        const results = giveNoOfResultsForYesNo(question,responses);
        question.options.map((option) => 
        value.push(results.get(option)?results.get(option):0)
        )
        return value
    }
    const generateBar = (question) => {
        const value = generateStats(question);
        const options = {
            colors:['#00e396','#008ffb','#ff4560','#feb019','#9d6a79'],
            plotOptions: {
                bar: {
                    distributed: true
                }
              },
            chart: {
                foreColor: '#000',
                type: 'bar',
            },
            series: [
                {
                    name: 'Option',
                    data: value
                }
            ],
            xaxis: {
                categories: question.options
            },
        }
                return options;
    }

    const generateDonut = (question) => {
        const value = generateStats(question);
        const options = {
            series:value,
            options: {
                labels: question.options,
                chart: {
                    foreColor: '#000',
                    
                    type: 'donut',
                },
                responsive: [{
                    breakpoint: 480,
                  options: {
                    chart: {
                      width: 200
                    },
                    legend: {
                         position: 'bottom',
                    }

                }
            }]
              }
        }
         return options;
    }

    const generateCustom = (question) => {
        const results = []
        responses.forEach((response)=>{
            if(response.question_id===question._id){
                results.push(response.answer)
            }
        })
        return results;
    }  
    
      
    return (
    <ResultsContainer>
        <h1>{title}</h1>
        <div>
            <h2>Responses received : {responses.length?responses.length/questions.length:0}</h2>
        </div> 
        {questions.map((question) => {
            const bar_options = generateBar(question);
            const donut_options = generateDonut(question);

            return <ResponseContainer>
            <h1>{question.question}</h1>
            <h2 style={{display:'flex',justifyContent:'center',color:'#dbdbdb'}}>Responses</h2>
            {question.type !=='custom'?
            <ChartsContainer>
                <Chart options={bar_options} series={bar_options.series} type={bar_options.chart.type} width={300} height={200} />   
                <Chart options={donut_options.options} series={donut_options.series} type='donut' width={300} height={200}/>
            </ChartsContainer>
            :<>
            {generateCustom(question).map((answer) => <h2>{answer}</h2>)}
            </>
            
            
            }
            
            
            </ResponseContainer>
        })  }
          
        </ResultsContainer>
  )
}

export default Results