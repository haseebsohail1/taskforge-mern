import { Router } from 'express';

import { getStats } from '../controllers/statsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', getStats);

export default router;
