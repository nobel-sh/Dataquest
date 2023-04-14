const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema(
    {
        owner_id:{
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide the owner of the survey'],
            ref:"User",
        },
        title:{
            type: String,
            required: [true,'Please provide the survey title'],
        },
        questions:{
            type: [String],
            required: [true,"Please provide survey questions"]
        },
        responses:{
            type: [mongoose.Schema.Types.Mixed],
            required: [true,"Please provide the survey response"]

        }
    }
)

module.exports = mongoose.model('Survey',surveySchema);