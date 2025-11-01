import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
}

export interface ISurvey extends Document {
    _id: Types.ObjectId;
    owner_id: Types.ObjectId;
    title: string;
    description: string;
    createdAt: Date;
}

export interface IQuestion extends Document {
    _id: Types.ObjectId;
    survey_id: Types.ObjectId;
    type: string;
    question: string;
    options?: unknown[];
}

export interface IResponse extends Document {
    _id: Types.ObjectId;
    survey_id: Types.ObjectId;
    question_id: Types.ObjectId;
    respondent_id: Types.ObjectId;
    answer: unknown;
}

// User DTOs
export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface RegisterRequestDto {
    username: string;
    email: string;
    password: string;
}

export interface UserResponseDto {
    username: string;
    user_id: Types.ObjectId;
    email: string;
}

export interface AuthResponseDto {
    accessToken: string;
    expiresIn: string;
    user: UserResponseDto;
}

// Survey DTOs
export interface CreateSurveyDto {
    owner: { id: string };
    title: string;
    description: string;
}

export interface SurveyResponseDto {
    _id: Types.ObjectId;
    owner_id: Types.ObjectId;
    title: string;
    description: string;
    createdAt: Date;
}

export interface SurveyWithQuestionsDto {
    survey: ISurvey;
    questions: IQuestion[];
}

// Question DTOs
export interface CreateQuestionDto {
    question: string;
    options?: unknown[];
    type: string;
}

// Response DTOs
export interface CreateResponseDto {
    survey: { id: string };
    question: { id: string };
    answer: unknown;
    respondent: { id: string };
}

export interface SurveyResultsDto {
    survey: ISurvey;
    questions: IQuestion[];
    responses: IResponse[];
}

export interface JwtPayload {
    user: {
        username: string;
        email: string;
        id: string;
    };
    iat?: number;
    exp?: number;
}

export interface ApiError {
    title: string;
    message: string;
    statusCode?: number;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
}
