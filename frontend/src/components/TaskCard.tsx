import React from 'react';

import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
  teamName?: string;
}

const TaskCard = ({ task, onEdit, onDelete, showActions = true, teamName }: TaskCardProps) => {
  const resolvedTeamName =
    teamName ??
    (typeof task.teamId === 'string' ? task.teamId : (task.teamId?.name ?? 'Unknown team'));

  return (
    <div className="card task-card">
      <div className="card-header">
        <h3>{task.title}</h3>
        <div className={`badge badge-${task.status}`}>{task.status}</div>
      </div>
      {task.description && <p className="muted">{task.description}</p>}
      <div className="meta">
        <span>Priority: {task.priority}</span>
        <span>Team: {resolvedTeamName}</span>
        <span>Assignee: {task.assignedTo?.name ?? 'Unassigned'}</span>
        <span>
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
        </span>
      </div>
      {showActions && onEdit && onDelete && (
        <div className="card-actions">
          <button className="btn secondary" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn danger" onClick={() => onDelete(task._id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
