const express = require("express");
const {
  getAllSurveys,
  createSurvey,
  getSurvey,
  updateSurvey,
  deleteSurvey,
} = require("../controllers/survey");
const { createQuestion } = require("../controllers/questions");
const { createResponse, getResponses } = require("../controllers/responses");

const router = express.Router();
const validateToken = require("../middleware/jwtTokenHandler");

router.use(validateToken);
router.route("/").get(getAllSurveys).post(createSurvey);
router.route("/:id").get(getSurvey).patch(updateSurvey).delete(deleteSurvey);
router.route("/:id/questions").post(createQuestion);
router.route("/:id/responses").post(createResponse).get(getResponses);

module.exports = router;
