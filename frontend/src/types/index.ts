export type UserRole = 'member' | 'lead' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: { _id: string; name: string; email: string } | null;
  teamId: { _id: string; name: string } | string;
  dueDate?: string;
  createdBy: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  members: Array<{ _id: string; name: string; email: string; role: UserRole }>;
  createdBy: string | { _id: string; name: string; email: string; role: UserRole };
  createdAt?: string;
  updatedAt?: string;
}
