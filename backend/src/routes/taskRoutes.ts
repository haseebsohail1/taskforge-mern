import { Router } from 'express';

import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  searchTasks,
  updateTask,
} from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { taskSchema, taskUpdateSchema } from '../utils/validationSchemas';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.get('/search', searchTasks);
router.get('/:id', getTask);
router.post('/', validate(taskSchema), createTask);
router.put('/:id', validate(taskUpdateSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
