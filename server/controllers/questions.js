const asyncHandler = require("express-async-handler");
const Question = require("../models/question");

const createQuestion = asyncHandler(async (req, res) => {
  const { question, options, type } = req.body;
  const survey_id = req.params.id;
  const newQuestion = await Question.create({
    survey_id,
    question,
    options,
    type,
  });
  res.status(200).json(newQuestion);
});

module.exports = { createQuestion };
