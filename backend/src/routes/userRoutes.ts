import { Router } from 'express';

import {
  changePassword,
  createUser,
  listUsers,
  searchUserByEmail,
  updateUserRole,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { changePasswordSchema, createUserSchema, updateUserRoleSchema } from '../utils/validationSchemas';

const router = Router();

router.use(authMiddleware);

router.get('/search', searchUserByEmail);
router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.put('/me/password', validate(changePasswordSchema), changePassword);

export default router;
