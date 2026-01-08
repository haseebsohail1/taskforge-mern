import { Router } from 'express';

import {
  addMember,
  createTeam,
  deleteTeam,
  getTeam,
  getTeams,
  updateTeam,
} from '../controllers/teamController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addMemberSchema, teamSchema, teamUpdateSchema } from '../utils/validationSchemas';

const router = Router();

router.use(authMiddleware);

router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/', validate(teamSchema), createTeam);
router.put('/:id', validate(teamUpdateSchema), updateTeam);
router.post('/:id/members', validate(addMemberSchema), addMember);
router.delete('/:id', deleteTeam);

export default router;
