import { api } from './api';

export interface UserListParams {
  search?: string;
  role?: string;
  limit?: number;
}

export const listUsers = async (params: UserListParams) => {
  const res = await api.get('/api/users', { params });
  return res.data.data.items as Array<{ _id: string; name: string; email: string; role: string }>;
};

export const updateUserRole = async (id: string, role: 'member' | 'lead' | 'admin') => {
  const res = await api.put(`/api/users/${id}/role`, { role });
  return res.data.data.user as { _id: string; name: string; email: string; role: string };
};

export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role: 'member' | 'lead';
}) => {
  const res = await api.post('/api/users', payload);
  return res.data.data.user as { _id: string; name: string; email: string; role: string };
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.put('/api/users/me/password', payload);
  return res.data.data as { message: string };
};
