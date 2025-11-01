import express, { Router } from 'express';
import {
    getAllSurveys,
    createSurvey,
    getSurvey,
    updateSurvey,
    deleteSurvey,
} from '../controllers/survey';
import { createQuestion } from '../controllers/questions';
import { createResponse, getResponses } from '../controllers/responses';
import validateToken from '../middleware/jwtTokenHandler';

const router: Router = express.Router();

router.use(validateToken);
router.route('/').get(getAllSurveys).post(createSurvey);
router.route('/:id').get(getSurvey).patch(updateSurvey).delete(deleteSurvey);
router.route('/:id/questions').post(createQuestion);
router.route('/:id/responses').post(createResponse).get(getResponses);

export default router;
