import { api } from './api';
import { Team } from '../types';

export const fetchTeams = async () => {
  const res = await api.get('/api/teams');
  return res.data.data.items as Team[];
};

export const createTeam = async (payload: {
  name: string;
  description?: string;
  memberIds?: string[];
}) => {
  const res = await api.post('/api/teams', payload);
  return res.data.data.team as Team;
};

export const updateTeam = async (
  teamId: string,
  payload: { name?: string; description?: string }
) => {
  const res = await api.put(`/api/teams/${teamId}`, payload);
  return res.data.data.team as Team;
};

export const addTeamMember = async (teamId: string, userId: string) => {
  const res = await api.post(`/api/teams/${teamId}/members`, { userId });
  return res.data.data.team as Team;
};

export const deleteTeam = async (teamId: string) => {
  await api.delete(`/api/teams/${teamId}`);
};

export const searchUserByEmail = async (email: string) => {
  const res = await api.get('/api/users/search', { params: { email } });
  return res.data.data.user as { _id: string; name: string; email: string; role: string } | null;
};
