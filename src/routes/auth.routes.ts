import { Router } from 'express';
import { signup, signin, getProfile, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', signin);
router.get('/me', getProfile);
router.get('/logout', logout);

export default router; 