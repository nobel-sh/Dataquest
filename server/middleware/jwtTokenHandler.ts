import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';
import { AuthenticationError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

export const validateToken = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const authHeader =
            req.headers.authorization || req.headers.Authorization;

        if (!authHeader || typeof authHeader !== 'string') {
            throw new AuthenticationError('No token provided');
        }

        if (!authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError(
                'Invalid token format. Use Bearer <token>'
            );
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new AuthenticationError('Token not found');
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
            req.user = decoded.user;
            next();
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new AuthenticationError('Token has expired');
            } else if (err instanceof jwt.JsonWebTokenError) {
                throw new AuthenticationError('Invalid token');
            } else if (err instanceof jwt.NotBeforeError) {
                throw new AuthenticationError('Token not active yet');
            }
            throw new AuthenticationError('Token verification failed');
        }
    }
);

export default validateToken;
