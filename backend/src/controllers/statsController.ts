import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { Team } from '../models/Team';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { UnauthorizedError } from '../utils/errors';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  const isAdmin = req.user.role === 'admin';
  const teams = isAdmin ? [] : await Team.find({ members: req.user.userId }).select('_id name');
  const teamIds = teams.map((team) => team._id);

  if (!isAdmin && teamIds.length === 0) {
    const totalUsers = req.user.role === 'admin' ? await User.countDocuments() : undefined;
    res.json({
      success: true,
      data: { total: 0, totalUsers, byStatus: {}, byPriority: {}, byTeam: [] },
    });
    return;
  }

  const matchStage = isAdmin ? {} : { teamId: { $in: teamIds } };
  const [result] = await Task.aggregate([
    { $match: matchStage },
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        byTeam: [{ $group: { _id: '$teamId', count: { $sum: 1 } } }],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const statusMap: Record<string, number> = {};
  for (const item of result.byStatus ?? []) {
    statusMap[item._id] = item.count;
  }

  const priorityMap: Record<string, number> = {};
  for (const item of result.byPriority ?? []) {
    priorityMap[item._id] = item.count;
  }

  const teamMap = new Map(teams.map((team) => [team._id.toString(), team.name]));
  const byTeam = (result.byTeam ?? []).map((item: { _id: mongoose.Types.ObjectId; count: number }) => ({
    teamId: item._id,
    name: teamMap.get(item._id.toString()) ?? 'Unknown',
    count: item.count,
  }));

  const total = result.total?.[0]?.count ?? 0;
  const totalUsers = req.user.role === 'admin' ? await User.countDocuments() : undefined;

  res.json({
    success: true,
    data: {
      total,
      totalUsers,
      byStatus: statusMap,
      byPriority: priorityMap,
      byTeam,
    },
  });
});
