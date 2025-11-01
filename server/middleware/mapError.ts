import { Request, Response, NextFunction } from 'express';
import { AppError, getErrorTitle } from '../utils/errors';
import { HttpStatus } from '../config';

const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Default to 500 if no status code is set
    const statusCode =
        err instanceof AppError
            ? err.statusCode
            : res.statusCode !== 200
            ? res.statusCode
            : HttpStatus.INTERNAL_SERVER_ERROR;

    const title = getErrorTitle(statusCode);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            title,
            message: err.message,
            stack: err.stack,
            statusCode,
        });
    }

    res.status(statusCode).json({
        title,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;
