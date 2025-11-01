import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
) => Promise<void | Response>;

// Wraps async route handlers to catch errors and pass them to error middleware
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
