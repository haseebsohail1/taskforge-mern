import { Router } from 'express';

import { login, logout, me, signup } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, signupSchema } from '../utils/validationSchemas';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

export default router;
