import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Question from '../models/question';
import { HttpStatus } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { ValidationError } from '../utils/errors';
import { CreateQuestionDto } from '../types';

export const createQuestion = asyncHandler(
    async (
        req: Request<{ id: string }, object, CreateQuestionDto>,
        res: Response
    ): Promise<void> => {
        const { question, options, type } = req.body;
        const survey_id = req.params.id;

        if (!question || !type) {
            throw new ValidationError('Question text and type are required');
        }

        if (!survey_id) {
            throw new ValidationError('Survey ID is required');
        }

        const newQuestion = await Question.create({
            survey_id: new Types.ObjectId(survey_id),
            question,
            options,
            type,
        });

        res.status(HttpStatus.CREATED).json(newQuestion);
    }
);
