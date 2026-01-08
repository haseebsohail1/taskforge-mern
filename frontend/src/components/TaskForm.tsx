import React, { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority, TaskStatus, Team } from '../types';

interface TaskFormProps {
  teams: Team[];
  initial?: Task | null;
  onSubmit: (payload: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    teamId: string;
    dueDate?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const TaskForm = ({ teams, initial, onSubmit, onCancel }: TaskFormProps) => {
  const { user } = useAuth();
  const leadTeams =
    user?.role === 'lead'
      ? teams.filter((team) => team.members.some((member) => member._id === user.id))
      : teams;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [teamId, setTeamId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description ?? '');
      setStatus(initial.status);
      setPriority(initial.priority);
      setTeamId(typeof initial.teamId === 'string' ? initial.teamId : initial.teamId._id);
      setAssignedTo(initial.assignedTo?._id ?? '');
      setDueDate(initial.dueDate ? initial.dueDate.slice(0, 10) : '');
    }
  }, [initial]);

  useEffect(() => {
    if (user?.role === 'lead' && leadTeams.length === 1) {
      setTeamId(leadTeams[0]._id);
    }
  }, [leadTeams, user?.role]);

  useEffect(() => {
    const members = teams.find((team) => team._id === teamId)?.members ?? [];
    const isAdminSelf = user?.role === 'admin' && assignedTo === user.id;
    if (assignedTo && !isAdminSelf && !members.some((member) => member._id === assignedTo)) {
      setAssignedTo('');
    }
  }, [teamId, teams, assignedTo, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (user?.role !== 'member') {
      if (!title.trim()) {
        setError('Title is required');
        return;
      }
      if (!teamId) {
        setError('Team is required');
        return;
      }
    }
    setError(null);
    setLoading(true);
    await onSubmit({
      title,
      description,
      status,
      priority,
      teamId,
      dueDate,
      assignedTo: assignedTo.trim() ? assignedTo.trim() : undefined,
    });
    setLoading(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit Task' : 'Create Task'}</h3>
      {error && <div className="error">{error}</div>}
      <label>
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={user?.role === 'member'}
        />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={user?.role === 'member'}
        />
      </label>
      <div className="form-row">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label>
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            disabled={user?.role === 'member'}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
      <label>
        Team
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          disabled={user?.role === 'member' || (user?.role === 'lead' && leadTeams.length === 1)}
        >
          <option value="">Select team</option>
          {(user?.role === 'lead' ? leadTeams : teams).map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Assignee
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          disabled={user?.role === 'member' || !teamId}
        >
          <option value="">{teamId ? 'Unassigned' : 'Select team first'}</option>
          {user?.role === 'admin' && <option value={user.id}>Assign to me (Admin)</option>}
          {teams
            .find((team) => String(team._id) === String(teamId))
            ?.members.filter((member) => {
              if (user?.role === 'lead') {
                return member.role === 'member';
              }
              if (user?.role === 'admin') {
                return member.role !== 'admin';
              }
              return true;
            })
            .map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.email})
              </option>
            ))}
        </select>
      </label>
      <label>
        Due Date
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={user?.role === 'member'}
        />
      </label>
      <div className="card-actions">
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button className="btn secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
