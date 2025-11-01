import dotenv from 'dotenv';

interface Config {
    port: number;
    mongoUri: string;
    jwtSecret: string;
    nodeEnv: string;
    jwtExpiresIn: string;
}

const requiredEnvVars = ['MONGO_URI', 'JWT_TOKEN'] as const;

dotenv.config();

export function validateEnv(): void {
    const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }
}

export const config: Config = {
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGO_URI!,
    jwtSecret: process.env.JWT_TOKEN!,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtExpiresIn: '30d',
};

export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
