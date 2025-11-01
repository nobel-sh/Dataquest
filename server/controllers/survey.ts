import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Survey from '../models/survey';
import Question from '../models/question';
import ResponseModel from '../models/response';
import { HttpStatus } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { CreateSurveyDto, SurveyWithQuestionsDto } from '../types';

export const getAllSurveys = asyncHandler(
    async (
        req: Request<object, object, object, { owner_id?: string }>,
        res: Response
    ): Promise<void> => {
        const { owner_id } = req.query;

        const query = owner_id
            ? { owner_id: new Types.ObjectId(owner_id) }
            : {};
        const surveys = await Survey.find(query).sort({ createdAt: -1 });

        res.status(HttpStatus.OK).json({ surveys });
    }
);

export const createSurvey = asyncHandler(
    async (
        req: Request<object, object, CreateSurveyDto>,
        res: Response
    ): Promise<void> => {
        const {
            owner: { id: owner_id },
            title,
            description,
        } = req.body;

        // Validate input
        if (!owner_id || !title) {
            throw new ValidationError('Owner ID and title are required');
        }

        // Create survey
        const survey = await Survey.create({
            owner_id: new Types.ObjectId(owner_id),
            title,
            description,
        });

        res.status(HttpStatus.CREATED).json(survey);
    }
);

export const getSurvey = asyncHandler(
    async (
        req: Request<object, object, object, { survey_id?: string }>,
        res: Response<SurveyWithQuestionsDto>
    ): Promise<void> => {
        const { survey_id: surveyID } = req.query;

        if (!surveyID) {
            throw new ValidationError('Survey ID is required');
        }

        const survey = await Survey.findById(surveyID);
        if (!survey) {
            throw new NotFoundError('Survey not found');
        }

        const questions = await Question.find({ survey_id: surveyID });

        res.status(HttpStatus.OK).json({ survey, questions });
    }
);

export const updateSurvey = asyncHandler(
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const { id: surveyID } = req.params;

        const survey = await Survey.findById(surveyID);
        if (!survey) {
            throw new NotFoundError('Survey not found');
        }

        const updatedSurvey = await Survey.findByIdAndUpdate(
            surveyID,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(HttpStatus.OK).json({ survey: updatedSurvey });
    }
);

export const deleteSurvey = asyncHandler(
    async (
        req: Request<object, object, object, { survey_id?: string }>,
        res: Response
    ): Promise<void> => {
        const { survey_id: surveyID } = req.query;

        if (!surveyID) {
            throw new ValidationError('Survey ID is required');
        }

        const survey = await Survey.findById(surveyID);
        if (!survey) {
            throw new NotFoundError('Survey not found');
        }

        // Delete survey
        await Survey.findByIdAndDelete(surveyID);

        // Delete associated questions
        const deletedQuestions = await Question.deleteMany({
            survey_id: surveyID,
        });

        // Delete associated responses
        const deletedResponses = await ResponseModel.deleteMany({
            survey_id: surveyID,
        });

        res.status(HttpStatus.OK).json({
            message: 'Survey deleted successfully',
            deletedQuestions: deletedQuestions.deletedCount,
            deletedResponses: deletedResponses.deletedCount,
        });
    }
);
