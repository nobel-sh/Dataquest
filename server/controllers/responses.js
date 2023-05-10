const asyncHandler = require('express-async-handler')
const Response = require('../models/response')
const Question = require('../models/question')
const Survey = require('../models/survey')

const createResponse= asyncHandler( async (req,res) => {
    
    const {survey:{id:survey_id},question:{id:question_id},answer,respondent:{id:respondent_id}} = req.body;
    if(!survey_id || !question_id || !answer || !respondent_id){
        res.status(400)
        throw new Error('Please provide all the details')
    }
    const response = await Response.findOne({survey_id,question_id,respondent_id})

    let newResponse = null;
    if(response){
        newResponse = await Response.findByIdAndUpdate(response._id,{answer})
    }
    else{
        newResponse = await Response.create({
            survey_id,
            question_id,
            respondent_id,
            answer});
        }

    res.status(200).json(newResponse)
    
})

const getResponses = asyncHandler(async (req,res) => {
    const {survey_id:surveyID} = req.query;
    const responses = await Response.find({
        survey_id:surveyID,
        })
    if(!responses){
        res.status(404);
        throw new Error("Response Not Found");
    }
    const questions = await Question.find({
        survey_id:surveyID
        })
    if(!questions){
        res.status(404);
        throw new Error("Survey doesnot have questions");
    }
    const survey = await Survey.findOne({
        _id:surveyID
    })

    if(!survey){
        res.status(404);
        throw new Error("Survey Not Found");
    }

    res.status(200).json({survey,questions,responses})
    }
)


module.exports = {createResponse,getResponses}