import { Request, Response } from 'express';

import { Team } from '../models/Team';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { validateObjectId } from '../utils/validateObjectId';

export const getTeams = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  const query = req.user.role === 'admin' ? {} : { members: req.user.userId };
  const teams = await Team.find(query)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email role');

  res.json({ success: true, data: { items: teams } });
});

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  validateObjectId(req.params.id);

  const team = await Team.findById(req.params.id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email role');
  if (!team) {
    throw new NotFoundError('Team not found');
  }

  if (req.user.role !== 'admin') {
    const isMember = team.members.some((member) => member._id.toString() === req.user?.userId);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this team');
    }
  }

  res.json({ success: true, data: { team } });
});

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Only admins can create teams');
  }

  const { name, description, memberIds = [] } = req.body as {
    name: string;
    description?: string;
    memberIds?: string[];
  };

  const normalizedMemberIds = Array.from(new Set(memberIds.map((id) => id.toString())));
  if (normalizedMemberIds.length > 0) {
    for (const id of normalizedMemberIds) {
      validateObjectId(id, 'memberIds');
    }
  }

  const members = normalizedMemberIds.length
    ? await User.find({ _id: { $in: normalizedMemberIds } }).select('_id')
    : [];

  if (members.length !== normalizedMemberIds.length) {
    throw new BadRequestError('Some memberIds do not match existing users');
  }

  const memberSet = new Set(members.map((member) => member._id.toString()));
  memberSet.add(req.user.userId);

  const team = await Team.create({
    name,
    description,
    members: Array.from(memberSet),
    createdBy: req.user.userId,
  });

  res.status(201).json({ success: true, data: { team } });
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  validateObjectId(req.params.id);

  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new NotFoundError('Team not found');
  }

  const isMember = team.members.some((member) => member.toString() === req.user?.userId);
  if (!isMember) {
    throw new ForbiddenError('Not a member of this team');
  }

  const updated = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });

  res.json({ success: true, data: { team: updated } });
});

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  validateObjectId(req.params.id);

  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new NotFoundError('Team not found');
  }

  const isAdmin = req.user.role === 'admin';
  const isCreator = team.createdBy.toString() === req.user.userId;
  const isLeadCreator = req.user.role === 'lead' && isCreator;

  if (!isAdmin && !isLeadCreator) {
    throw new ForbiddenError('Only admins or the lead who created the team can delete it');
  }

  await team.deleteOne();

  res.json({ success: true, data: { message: 'Team deleted' } });
});
export const addMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  validateObjectId(req.params.id);
  validateObjectId(req.body.userId, 'userId');
  if (req.body.userId === req.user.userId && req.user.role === 'admin') {
    throw new ForbiddenError('Admins cannot add themselves to teams');
  }

  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new NotFoundError('Team not found');
  }

  const isCreator = team.createdBy.toString() === req.user.userId;
  const isAdmin = req.user.role === 'admin';
  const isLead = req.user.role === 'lead';
  const isMember = team.members.some((member) => member.toString() === req.user?.userId);
  if (!isCreator && !isAdmin && !(isLead && isMember)) {
    throw new ForbiddenError('Only team creator, admin, or team leads can add members');
  }

  const user = await User.findById(req.body.userId);
  if (!user) {
    throw new BadRequestError('User does not exist');
  }

  const alreadyMember = team.members.some((member) => member.toString() === req.body.userId);
  if (alreadyMember) {
    throw new BadRequestError('User already a member');
  }

  team.members.push(user._id);
  await team.save();

  res.json({ success: true, data: { team } });
});
