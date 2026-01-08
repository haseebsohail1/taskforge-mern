import { Request, Response } from 'express';

import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../utils/errors';
import { validateObjectId } from '../utils/validateObjectId';

export const searchUserByEmail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role === 'member') {
    throw new ForbiddenError('Only admins or leads can list users');
  }
  const email = String(req.query.email ?? '').trim().toLowerCase();
  if (!email) {
    throw new BadRequestError('Email query param is required');
  }

  const user = await User.findOne({ email }).select('name email role');
  if (!user) {
    res.json({ success: true, data: { user: null } });
    return;
  }

  res.json({ success: true, data: { user } });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role === 'member') {
    throw new ForbiddenError('Only admins or leads can list users');
  }

  const search = String(req.query.search ?? '').trim();
  const role = String(req.query.role ?? '').trim();
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  if (search && search.length < 2) {
    throw new BadRequestError('Search query must be at least 2 characters');
  }
  if (role && role !== 'member' && req.user.role !== 'admin') {
    throw new BadRequestError('Only admins can filter by lead/admin roles');
  }

  const query: Record<string, unknown> = {};
  if (role) {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  } else if (req.user.role !== 'admin') {
    throw new BadRequestError('Search query must be provided for non-admin users');
  }

  const users = await User.find(query).select('name email role').limit(limit);
  res.json({ success: true, data: { items: users } });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Only admins can update user roles');
  }
  validateObjectId(req.params.id);
  if (req.params.id === req.user.userId) {
    throw new ForbiddenError('Admins cannot change their own role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  ).select('name email role');

  if (!user) {
    throw new BadRequestError('User not found');
  }

  res.json({ success: true, data: { user } });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Only admins can create users');
  }

  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role: 'member' | 'lead';
  };

  const existing = await User.findOne({ email });
  if (existing) {
    throw new BadRequestError('Email already in use');
  }

  const user = await User.create({ name, email, password, role });

  res.status(201).json({
    success: true,
    data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await User.findById(req.user.userId).select('+password');
  if (!user) {
    throw new BadRequestError('User not found');
  }

  const match = await user.comparePassword(currentPassword);
  if (!match) {
    throw new BadRequestError('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, data: { message: 'Password updated' } });
});
