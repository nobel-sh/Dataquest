const asyncHandler = require('express-async-handler')
const Survey = require('../models/survey')
const Question = require('../models/question')

const getAllSurveys = asyncHandler( async (req,res) => {
    const surveys = await Survey.find({owner_id:req.query.owner_id});
    res.status(200).json({surveys})
    }
)

const createSurvey = asyncHandler( async (req,res) => {

    const {owner:{id:owner_id},title} = req.body;
    
    if (!owner_id || !title) {
        res.status(400);
        throw new Error("All fields are mandatory !");   
    }

    const ifSurveyExists = await Survey.exists({title});
    if(ifSurveyExists){
        res.status(400);
        throw new Error("Survey with this title already exists");
    }

    

    const survey = await Survey.create({
        owner_id,
        title
    })
    res.status(200).json(survey)
})

const getSurvey = asyncHandler(async (req,res) => {
    const {survey_id:surveyID} = req.query;
    const survey = await Survey.findOne({
        _id:surveyID
    })
    const questions = await Question.find({
        survey_id:surveyID})
    if(!survey){
        res.status(404);
        throw new Error("Survey Not Found");
    }
    res.status(200).json({survey,questions})
    }
)

const updateSurvey = asyncHandler( async (req,res) => {
    const {id:surveyID} = req.params;
    
    const survey = await Survey.findOne({_id:surveyID});
    if(!survey){
        res.status(404);
        throw new Error("Survey Not Found");
    }
    if(survey.user_id.toString() !== req.params.id){
        
    }
    const newSurvey = await Survey.findByIdAndUpdate(
    {_id:surveyID},
    req.body,
    {new:true,runValidators:true}
    )
    res.status(200).json({newSurvey})
} )

const deleteSurvey = asyncHandler( async (req,res) => {
    const {id:surveyID} = req.params;
    
    const ifSurveyExists = await Survey.exists({_id:surveyID});
    if(!ifSurveyExists){
        res.status(404);
        throw new Error("Survey Not Found");
    }
    const survey = await Survey.findByIdAndDelete({
        _id:surveyID
    })
    res.status(200).json({survey})
    }
)

module.exports = {
    getAllSurveys,
    createSurvey,
    getSurvey,
    updateSurvey,
    deleteSurvey
}