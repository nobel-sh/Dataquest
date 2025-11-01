import mongoose, { Schema, Model } from 'mongoose';
import { IQuestion } from '../types';

const questionSchema = new Schema<IQuestion>(
    {
        survey_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Please provide the Survey ID'],
            ref: 'Survey',
            index: true,
        },
        type: {
            type: String,
            required: [true, 'Please provide the question type'],
            enum: ['text', 'multiple_choice', 'yes_no', 'dropdown', 'custom'],
        },
        question: {
            type: String,
            required: [true, 'Please provide the question text'],
            trim: true,
        },
        options: {
            type: [Schema.Types.Mixed],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

questionSchema.index({ survey_id: 1 });

const Question: Model<IQuestion> = mongoose.model<IQuestion>(
    'Question',
    questionSchema
);

export default Question;
