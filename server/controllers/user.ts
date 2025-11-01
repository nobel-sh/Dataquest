import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { config, HttpStatus } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import {
    ValidationError,
    AuthenticationError,
    NotFoundError,
} from '../utils/errors';
import {
    LoginRequestDto,
    RegisterRequestDto,
    AuthResponseDto,
    UserResponseDto,
} from '../types';

export const userLogin = asyncHandler(
    async (
        req: Request<object, object, LoginRequestDto>,
        res: Response<AuthResponseDto>
    ): Promise<void> => {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            throw new ValidationError('Email and password are required');
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            {
                user: {
                    username: user.username,
                    email: user.email,
                    id: user.id,
                },
            },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
        );

        // Return response
        const userResponse: UserResponseDto = {
            username: user.username,
            user_id: user._id,
            email: user.email,
        };

        res.status(HttpStatus.OK).json({
            accessToken,
            expiresIn: config.jwtExpiresIn,
            user: userResponse,
        });
    }
);

export const userRegister = asyncHandler(
    async (
        req: Request<object, object, RegisterRequestDto>,
        res: Response
    ): Promise<void> => {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            throw new ValidationError(
                'Username, email, and password are required'
            );
        }

        if (password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ValidationError('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(HttpStatus.CREATED).json({
            message: 'User registered successfully',
        });
    }
);

export const getActiveUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            throw new AuthenticationError('User not authenticated');
        }

        res.status(HttpStatus.OK).json(req.user);
    }
);
