import express, { Router, Request, Response } from 'express';
import surveyRoutes from './survey';
import userRoutes from './user';

const router: Router = express.Router();

const healthCheckHandler = (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
};

const fallbackHandler = (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
};

router.get('/health', healthCheckHandler);
router.use('/surveys', surveyRoutes);
router.use('/users', userRoutes);
// this should always be the last route
router.all('*', fallbackHandler);

export default router;
