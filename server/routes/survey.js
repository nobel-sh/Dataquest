const express = require('express')
const {
    getAllSurveys,
    createSurvey,
    getSurvey,
    updateSurvey,
    deleteSurvey
} = require('../controllers/survey')
const router = express.Router()
const validateToken = require('../middleware/jwtTokenHandler');

router.use(validateToken)
router.route('/').get(getAllSurveys).post(createSurvey)
router.route('/:id').get(getSurvey).patch(updateSurvey).delete(deleteSurvey)

module.exports = router