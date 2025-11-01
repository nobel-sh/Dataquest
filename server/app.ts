import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import errorHandler from './middleware/mapError';
import connectDB from './db/connectDB';
import routes from './routes';

const createApp = (): Application => {
    const app: Application = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    app.use('/api/v1', routes);
    app.use(errorHandler);

    return app;
};

const startServer = async (): Promise<void> => {
    try {
        await connectDB(config.mongoUri);

        const app = createApp();

        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
            console.log(`API: http://localhost:${config.port}/api/v1`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

const setupGracefulShutdown = (): void => {
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        process.exit(0);
    });
};

const initApp = async (): Promise<void> => {
    setupGracefulShutdown();
    await startServer();
};

initApp();
