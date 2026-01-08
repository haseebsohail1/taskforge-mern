import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { Team } from '../models/Team';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { validateObjectId } from '../utils/validateObjectId';

const getUserTeamIds = async (userId: string): Promise<mongoose.Types.ObjectId[]> => {
  const teams = await Team.find({ members: userId }).select('_id');
  return teams.map((team) => team._id);
};

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  const {
    status,
    priority,
    teamId,
    assignedTo,
    dueBefore,
    dueAfter,
    createdBy,
    page = '1',
    limit = '10',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const isAdmin = req.user.role === 'admin';
  const userTeamIds = isAdmin ? [] : await getUserTeamIds(req.user.userId);

  if (teamId) {
    validateObjectId(String(teamId), 'teamId');
    if (!isAdmin) {
      const isMember = userTeamIds.some((id) => id.toString() === String(teamId));
      if (!isMember) {
        throw new ForbiddenError('Not a member of this team');
      }
    }
  }

  const query: Record<string, unknown> = {};
  if (teamId) {
    query.teamId = teamId;
  } else if (!isAdmin) {
    query.teamId = { $in: userTeamIds };
  }

  if (status) {
    query.status = status;
  }
  if (priority) {
    query.priority = priority;
  }
  if (assignedTo) {
    validateObjectId(String(assignedTo), 'assignedTo');
    query.assignedTo = assignedTo;
  }
  if (createdBy) {
    validateObjectId(String(createdBy), 'createdBy');
    query.createdBy = createdBy;
  }
  if (dueBefore || dueAfter) {
    query.dueDate = {};
    if (dueBefore) {
      (query.dueDate as Record<string, unknown>).$lte = new Date(String(dueBefore));
    }
    if (dueAfter) {
      (query.dueDate as Record<string, unknown>).$gte = new Date(String(dueAfter));
    }
  }

  const pageNum = Math.max(parseInt(String(page), 10), 1);
  const limitNum = Math.max(parseInt(String(limit), 10), 1);
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .populate('teamId', 'name')
    .sort({ [String(sortBy)]: sortDirection })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Task.countDocuments(query);

  res.json({
    success: true,
    data: {
      items: tasks,
      total,
      page: pageNum,
      limit: limitNum,
    },
  });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  validateObjectId(req.params.id);

  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('teamId', 'name');
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  if (req.user.role !== 'admin') {
    const isMember = await Team.exists({ _id: task.teamId, members: req.user.userId });
    if (!isMember) {
      throw new ForbiddenError('Not a member of this team');
    }
  }

  res.json({ success: true, data: { task } });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role === 'member') {
    throw new ForbiddenError('Members cannot create tasks');
  }

  const { title, description, status, priority, assignedTo, teamId, dueDate } = req.body;
  validateObjectId(teamId, 'teamId');
  let assigneeRole: string | null = null;
  let assigneeId: string | null = null;
  if (assignedTo) {
    validateObjectId(assignedTo, 'assignedTo');
    const assignee = await User.findById(assignedTo).select('_id role');
    if (!assignee) {
      throw new BadRequestError('Assigned user does not exist');
    }
    assigneeRole = assignee.role;
    assigneeId = assignee._id.toString();
    if (assignee.role === 'admin' && assigneeId !== req.user.userId) {
      throw new ForbiddenError('Only the admin can assign tasks to themselves');
    }
    if (req.user.role === 'admin' && assignee.role === 'admin' && assigneeId !== req.user.userId) {
      throw new ForbiddenError('Only the admin can assign tasks to themselves');
    }
    if (req.user.role === 'lead' && assignee.role !== 'member') {
      throw new ForbiddenError('Leads can assign tasks only to members');
    }
  }

  const team = await Team.findById(teamId);
  if (!team) {
    throw new BadRequestError('Team does not exist');
  }
  const isAdmin = req.user.role === 'admin';
  const isMember = team.members.some((member) => member.toString() === req.user?.userId);
  if (!isAdmin && !isMember) {
    if (req.user.role === 'lead') {
      throw new ForbiddenError('Leads can only create tasks for their own teams');
    }
    throw new ForbiddenError('Not a member of this team');
  }
  if (assignedTo) {
    const isAdminSelf =
      assigneeRole === 'admin' && assigneeId === req.user.userId && req.user.role === 'admin';
    if (!isAdminSelf) {
      const isAssigneeMember = team.members.some((member) => member.toString() === assignedTo);
      if (!isAssigneeMember) {
        throw new BadRequestError('Assignee must be a member of the team');
      }
    }
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    assignedTo: assignedTo || undefined,
    teamId,
    dueDate,
    createdBy: req.user.userId,
  });

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('teamId', 'name');

  res.status(201).json({ success: true, data: { task: populated } });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  validateObjectId(req.params.id);

  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const isMember = await Team.exists({ _id: task.teamId, members: req.user.userId });
  if (!isMember) {
    throw new ForbiddenError('Not a member of this team');
  }

  if (req.body.teamId) {
    validateObjectId(req.body.teamId, 'teamId');
    const newTeam = await Team.findById(req.body.teamId);
    if (!newTeam) {
      throw new BadRequestError('Team does not exist');
    }
    const isMemberNewTeam = newTeam.members.some((member) => member.toString() === req.user?.userId);
    if (!isMemberNewTeam) {
      throw new ForbiddenError('Not a member of this team');
    }
  }

  if (req.body.assignedTo) {
    validateObjectId(req.body.assignedTo, 'assignedTo');
    const assignee = await User.findById(req.body.assignedTo).select('_id role');
    if (!assignee) {
      throw new BadRequestError('Assigned user does not exist');
    }
    if (assignee.role === 'admin' && assignee._id.toString() !== req.user.userId) {
      throw new ForbiddenError('Only the admin can assign tasks to themselves');
    }
    if (req.user.role === 'admin' && assignee.role === 'admin' && assignee._id.toString() !== req.user.userId) {
      throw new ForbiddenError('Only the admin can assign tasks to themselves');
    }
    if (req.user.role === 'lead' && assignee.role !== 'member') {
      throw new ForbiddenError('Leads can assign tasks only to members');
    }
    const isAssigneeMember = await Team.exists({
      _id: task.teamId,
      members: req.body.assignedTo,
    });
    const isAdminSelf =
      assignee.role === 'admin' &&
      assignee._id.toString() === req.user.userId &&
      req.user.role === 'admin';
    if (!isAdminSelf && !isAssigneeMember) {
      throw new BadRequestError('Assignee must be a member of the team');
    }
  }

  if (req.user.role === 'member') {
    if (task.assignedTo?.toString() !== req.user.userId) {
      throw new ForbiddenError('Members can only update tasks assigned to them');
    }
    const allowed = ['status'];
    const updates = Object.keys(req.body);
    const invalidFields = updates.filter((field) => !allowed.includes(field));
    if (invalidFields.length > 0) {
      throw new ForbiddenError('Members can only update task status');
    }
  }

  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('assignedTo', 'name email')
    .populate('teamId', 'name');

  res.json({ success: true, data: { task: updated } });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  validateObjectId(req.params.id);

  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const isMember = await Team.exists({ _id: task.teamId, members: req.user.userId });
  if (!isMember) {
    throw new ForbiddenError('Not a member of this team');
  }

  const isCreator = task.createdBy.toString() === req.user.userId;
  const isAdmin = req.user.role === 'admin';
  if (!isCreator && !isAdmin) {
    throw new ForbiddenError('Only creator or admin can delete tasks');
  }

  await task.deleteOne();

  res.json({ success: true, data: { message: 'Task deleted' } });
});

export const searchTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const q = String(req.query.q ?? '').trim();
  if (!q) {
    throw new BadRequestError('Query param q is required');
  }

  const isAdmin = req.user.role === 'admin';
  const teamFilter = isAdmin ? {} : { teamId: { $in: await getUserTeamIds(req.user.userId) } };
  const tasks = await Task.find({
    ...teamFilter,
    $or: [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }],
  })
    .populate('assignedTo', 'name email')
    .populate('teamId', 'name')
    .limit(50);

  res.json({ success: true, data: { items: tasks } });
});
