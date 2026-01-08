import { api } from './api';
import { Task } from '../types';

export interface TaskFilters {
  status?: string;
  priority?: string;
  teamId?: string;
  assignedTo?: string;
  dueBefore?: string;
  dueAfter?: string;
}

export const fetchTasks = async (filters: TaskFilters) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
  );
  const res = await api.get('/api/tasks', { params });
  return res.data.data.items as Task[];
};

export const createTask = async (payload: Record<string, unknown>) => {
  const res = await api.post('/api/tasks', payload);
  return res.data.data.task as Task;
};

export const updateTask = async (id: string, payload: Record<string, unknown>) => {
  const res = await api.put(`/api/tasks/${id}`, payload);
  return res.data.data.task as Task;
};

export const deleteTask = async (id: string) => {
  await api.delete(`/api/tasks/${id}`);
};
