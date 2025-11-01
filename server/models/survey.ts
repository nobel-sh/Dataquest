import mongoose, { Schema, Model } from 'mongoose';
import { ISurvey } from '../types';

const surveySchema = new Schema<ISurvey>(
    {
        owner_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Please provide the owner of the survey'],
            ref: 'User',
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Please provide the survey title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide the survey description'],
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

surveySchema.index({ owner_id: 1, createdAt: -1 });

const Survey: Model<ISurvey> = mongoose.model<ISurvey>('Survey', surveySchema);

export default Survey;
