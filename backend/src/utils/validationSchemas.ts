import Joi from 'joi';

export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const taskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('').optional(),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  assignedTo: Joi.string().optional(),
  teamId: Joi.string().required(),
  dueDate: Joi.date().optional(),
});

export const taskUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().allow('').optional(),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  assignedTo: Joi.string().optional().allow(null, ''),
  teamId: Joi.string().optional(),
  dueDate: Joi.date().optional().allow(null),
});

export const teamSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('').optional(),
  memberIds: Joi.array().items(Joi.string()).optional(),
});

export const teamUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().allow('').optional(),
});

export const addMemberSchema = Joi.object({
  userId: Joi.string().required(),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('member', 'lead', 'admin').required(),
});

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  role: Joi.string().valid('member', 'lead').required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(100).required(),
});
