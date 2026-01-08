import { Request, Response } from 'express';

import { IUser, User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { signToken } from '../utils/jwt';

const safeUser = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new BadRequestError('Email already in use');
  }

  const user = await User.create({ name, email, password });
  const token = signToken({ userId: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion });

  res.status(201).json({
    success: true,
    data: { token, user: safeUser(user) },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = signToken({ userId: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion });

  res.json({
    success: true,
    data: { token, user: safeUser(user) },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  await User.findByIdAndUpdate(req.user.userId, { $inc: { tokenVersion: 1 } });

  res.json({ success: true, data: { message: 'Logged out' } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new UnauthorizedError();
  }

  res.json({ success: true, data: { user: safeUser(user) } });
});
