const mongoose = require('mongoose')

const responseSchema = new mongoose.Schema(
    {
        survey_id:{
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide the Survey ID'],
            ref:"Survey",
        },
        question_id:{
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide the Question ID'],
            ref:"Question",
        },
        respondent_id:{
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide the Respondent ID'],
            ref:"User",
        },
        answer:{
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'Please provide the answer'],
        }
    }
)

module.exports = mongoose.model('Response',responseSchema);