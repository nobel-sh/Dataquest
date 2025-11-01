import express, { Router } from 'express';
import { userLogin, userRegister, getActiveUser } from '../controllers/user';
import validateToken from '../middleware/jwtTokenHandler';

const router: Router = express.Router();

router.post('/login', userLogin);
router.post('/register', userRegister);

// Protected route
router.get('/current', validateToken, getActiveUser);

export default router;
