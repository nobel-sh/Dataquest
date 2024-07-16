const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide the owner of the survey"],
    ref: "User",
  },
  title: {
    type: String,
    required: [true, "Please provide the survey title"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Survey", surveySchema);
