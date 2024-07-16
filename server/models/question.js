const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  survey_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide the Survey ID"],
    ref: "Survey",
  },
  type: {
    type: String,
    required: [true, "Please provide the survey type"],
  },
  question: {
    type: String,
    required: [true, "Please provide the survey title"],
  },
  options: {
    type: [mongoose.Schema.Types.Mixed],
  },
});

module.exports = mongoose.model("Question", surveySchema);
