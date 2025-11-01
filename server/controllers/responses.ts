import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ResponseModel from '../models/response';
import Question from '../models/question';
import Survey from '../models/survey';
import { HttpStatus } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { CreateResponseDto, SurveyResultsDto } from '../types';

export const createResponse = asyncHandler(
    async (
        req: Request<object, object, CreateResponseDto>,
        res: Response
    ): Promise<void> => {
        const {
            survey: { id: survey_id },
            question: { id: question_id },
            answer,
            respondent: { id: respondent_id },
        } = req.body;

        // Validate input
        if (!survey_id || !question_id || !answer || !respondent_id) {
            throw new ValidationError('All fields are required');
        }

        // Check if response already exists
        const existingResponse = await ResponseModel.findOne({
            survey_id: new Types.ObjectId(survey_id),
            question_id: new Types.ObjectId(question_id),
            respondent_id: new Types.ObjectId(respondent_id),
        });

        let response;

        if (existingResponse) {
            // Update existing response
            response = await ResponseModel.findByIdAndUpdate(
                existingResponse._id,
                { answer },
                { new: true }
            );
        } else {
            // Create new response
            response = await ResponseModel.create({
                survey_id: new Types.ObjectId(survey_id),
                question_id: new Types.ObjectId(question_id),
                respondent_id: new Types.ObjectId(respondent_id),
                answer,
            });
        }

        res.status(HttpStatus.CREATED).json(response);
    }
);

export const getResponses = asyncHandler(
    async (
        req: Request<object, object, object, { survey_id?: string }>,
        res: Response<SurveyResultsDto>
    ): Promise<void> => {
        const { survey_id: surveyID } = req.query;

        if (!surveyID) {
            throw new ValidationError('Survey ID is required');
        }

        // Fetch survey
        const survey = await Survey.findById(surveyID);
        if (!survey) {
            throw new NotFoundError('Survey not found');
        }

        // Fetch questions
        const questions = await Question.find({ survey_id: surveyID });
        if (!questions || questions.length === 0) {
            throw new NotFoundError('Survey has no questions');
        }

        // Fetch responses
        const responses = await ResponseModel.find({ survey_id: surveyID });

        res.status(HttpStatus.OK).json({ survey, questions, responses });
    }
);
