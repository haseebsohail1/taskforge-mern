import React, { useEffect, useState } from 'react';

import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import { createTask, deleteTask, fetchTasks, updateTask } from '../services/tasks';
import { fetchTeams } from '../services/teams';
import { Task, TaskPriority, TaskStatus, Team } from '../types';

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    teamId: '',
    assignedTo: '',
    dueBefore: '',
    dueAfter: '',
  });
  const [selected, setSelected] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [taskData, teamData] = await Promise.all([fetchTasks(filters), fetchTeams()]);
      setTasks(taskData);
      setTeams(teamData);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (payload: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    teamId: string;
    dueDate?: string;
  }) => {
    try {
      if (selected) {
        if (user?.role === 'member') {
          await updateTask(selected._id, { status: payload.status });
        } else {
          await updateTask(selected._id, payload);
        }
      } else {
        await createTask(payload);
      }
      setSelected(null);
      setShowForm(false);
      await load();
    } catch {
      setError('Failed to save task');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await load();
    } catch {
      setError('Failed to delete task');
    }
  };

  const applyFilters = async () => {
    await load();
  };

  const assignedTasks = tasks.filter((task) => task.assignedTo?._id === user?.id);

  const assigneeOptions = Array.from(
    new Map(
      teams
        .flatMap((team) => team.members)
        .map((member) => [member._id, member])
    ).values()
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="muted">Create, edit, and filter team tasks.</p>
        </div>
        {user?.role !== 'member' && (
          <button className="btn" onClick={() => setShowForm(true)}>
            Add Task
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filters.teamId}
          onChange={(e) => setFilters({ ...filters, teamId: e.target.value })}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
        <select
          value={filters.assignedTo}
          onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
        >
          <option value="">All Assignees</option>
          {assigneeOptions.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.dueAfter}
          onChange={(e) => setFilters({ ...filters, dueAfter: e.target.value })}
        />
        <input
          type="date"
          value={filters.dueBefore}
          onChange={(e) => setFilters({ ...filters, dueBefore: e.target.value })}
        />
        <button className="btn secondary" onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      {loading ? (
        <div>Loading tasks...</div>
      ) : user?.role === 'member' ? (
        <div className="table">
          <div className="table-row table-head">
            <span>Title</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Team</span>
          </div>
          {assignedTasks.map((task) => (
            <div className="table-row" key={task._id}>
              <span>{task.title}</span>
              <span>
                <select
                  value={task.status}
                  onChange={(e) =>
                    updateTask(task._id, { status: e.target.value as TaskStatus }).then(load)
                  }
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </span>
              <span>{task.priority}</span>
              <span>{typeof task.teamId === 'string' ? task.teamId : task.teamId.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="table">
          <div className="table-row table-head">
            <span>Title</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Assignee</span>
          </div>
          {tasks.map((task) => (
            <div className="table-row" key={task._id}>
              <span>{task.title}</span>
              <span>{task.status}</span>
              <span>{task.priority}</span>
              <span>{task.assignedTo?.name ?? 'Unassigned'}</span>
              <div className="card-actions">
                <button
                  className="btn secondary"
                  onClick={() => {
                    setSelected(task);
                    setShowDetails(true);
                  }}
                >
                  View Details
                </button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setSelected(task);
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                <button className="btn danger" onClick={() => handleDelete(task._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && user?.role !== 'member' && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <TaskForm
              teams={teams}
              initial={selected}
              onSubmit={handleSubmit}
              onCancel={() => {
                setSelected(null);
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}

      {showDetails && selected && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="card">
              <div className="card-header">
                <h3>{selected.title}</h3>
                <button className="btn secondary" onClick={() => setShowDetails(false)}>
                  Close
                </button>
              </div>
              <div className="detail-grid">
                <div>
                  <p className="muted">Description</p>
                  <p>{selected.description ?? 'No description'}</p>
                </div>
                <div>
                  <p className="muted">Status</p>
                  <p>{selected.status}</p>
                </div>
                <div>
                  <p className="muted">Priority</p>
                  <p>{selected.priority}</p>
                </div>
                <div>
                  <p className="muted">Assignee</p>
                  <p>{selected.assignedTo?.name ?? 'Unassigned'}</p>
                </div>
                <div>
                  <p className="muted">Team</p>
                  <p>{typeof selected.teamId === 'string' ? selected.teamId : selected.teamId.name}</p>
                </div>
                <div>
                  <p className="muted">Due Date</p>
                  <p>
                    {selected.dueDate ? new Date(selected.dueDate).toLocaleDateString() : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
