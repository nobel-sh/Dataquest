import mongoose, { Schema, Model } from 'mongoose';
import { IResponse } from '../types';

const responseSchema = new Schema<IResponse>(
    {
        survey_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Please provide the Survey ID'],
            ref: 'Survey',
            index: true,
        },
        question_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Please provide the Question ID'],
            ref: 'Question',
            index: true,
        },
        respondent_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Please provide the Respondent ID'],
            ref: 'User',
            index: true,
        },
        answer: {
            type: Schema.Types.Mixed,
            required: [true, 'Please provide the answer'],
        },
    },
    {
        timestamps: true,
    }
);

responseSchema.index({ survey_id: 1, question_id: 1, respondent_id: 1 });

const Response: Model<IResponse> = mongoose.model<IResponse>(
    'Response',
    responseSchema
);

export default Response;
