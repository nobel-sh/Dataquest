import { HttpStatusCode, HttpStatus } from '../config';

export class AppError extends Error {
    constructor(
        public statusCode: HttpStatusCode,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Access forbidden') {
        super(HttpStatus.FORBIDDEN, message);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(HttpStatus.NOT_FOUND, message);
    }
}

export function getErrorTitle(statusCode: number): string {
    switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
            return 'Validation Error';
        case HttpStatus.UNAUTHORIZED:
            return 'Authorization Error';
        case HttpStatus.FORBIDDEN:
            return 'Forbidden';
        case HttpStatus.NOT_FOUND:
            return 'Not Found';
        case HttpStatus.INTERNAL_SERVER_ERROR:
            return 'Server Error';
        default:
            return 'Error';
    }
}
