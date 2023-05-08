const asyncHandler = require('express-async-handler')
const Question = require('../models/question')

const createQuestion= asyncHandler( async (req,res) => {

    const {question,options,type,survey:{id:survey_id}} = req.body;
    const  newQuestion = await Question.create({
        survey_id,
        question,
        options,
        type});
    console.log(newQuestion);
    res.status(200).json(newQuestion)
})

module.exports = {createQuestion}