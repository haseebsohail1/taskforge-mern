import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { fetchTasks, updateTask } from '../services/tasks';
import { fetchTeams } from '../services/teams';
import { api } from '../services/api';
import { Task, Team, TaskStatus } from '../types';

const DashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    totalUsers?: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [taskData, teamData, statsRes] = await Promise.all([
          fetchTasks({}),
          fetchTeams(),
          api.get('/api/stats'),
        ]);
        setTasks(taskData);
        setTeams(teamData);
        setStats(statsRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.role]);

  const myTasks = tasks.filter((task) => task.assignedTo?._id === user?.id);
  const teamTasks = tasks.filter((task) => task.assignedTo?._id !== user?.id);
  const teamMap = new Map(teams.map((team) => [team._id, team.name]));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of your tasks and team activity.</p>
        </div>
      </div>

      {user?.role === 'admin' && (
        <section className="card">
          <div className="card-header">
            <h2 className="section-title">Admin Stats</h2>
            <Link className="btn secondary" to="/admin">
              Go to Admin Dashboard
            </Link>
          </div>
          {stats ? (
            <div className="grid">
              <div className="card">
                <h3>Total Tasks</h3>
                <p className="muted">{stats.total}</p>
              </div>
              <div className="card">
                <h3>Total Users</h3>
                <p className="muted">{stats.totalUsers ?? '-'}</p>
              </div>
              <div className="card">
                <h3>By Status</h3>
                <div className="list">
                  {Object.entries(stats.byStatus).map(([key, value]) => (
                    <div key={key} className="card-actions">
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3>By Priority</h3>
                <div className="list">
                  {Object.entries(stats.byPriority).map(([key, value]) => (
                    <div key={key} className="card-actions">
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>Loading stats...</div>
          )}
        </section>
      )}

      {user?.role !== 'admin' && (
        <section className="card">
          <div className="card-header">
            <h2 className="section-title">Your Summary</h2>
            <span className="muted">{teams.length} teams</span>
          </div>
          {stats ? (
            <div className="grid">
              <div className="card">
                <h3>My Tasks</h3>
                <p className="muted">{myTasks.length}</p>
              </div>
              <div className="card">
                <h3>Team Tasks</h3>
                <p className="muted">{teamTasks.length}</p>
              </div>
              <div className="card">
                <h3>Tasks by Status</h3>
                <div className="list">
                  {Object.entries(stats.byStatus).map(([key, value]) => (
                    <div key={key} className="card-actions">
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3>Tasks by Priority</h3>
                <div className="list">
                  {Object.entries(stats.byPriority).map(([key, value]) => (
                    <div key={key} className="card-actions">
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3>My Teams</h3>
                <div className="list">
                  {teams.map((team) => (
                    <div key={team._id} className="card-actions">
                      <span>{team.name}</span>
                      <span className="muted">{team.members.length} members</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>Loading stats...</div>
          )}
        </section>
      )}

      {loading ? (
        <div>Loading tasks...</div>
      ) : user?.role === 'admin' ? (
        <section>
          <h2>My Tasks</h2>
          {myTasks.length === 0 && <p className="muted">No assigned tasks.</p>}
          <div className="task-board">
            {myTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                showActions={false}
                teamName={
                  typeof task.teamId === 'string'
                    ? teamMap.get(task.teamId) ?? 'Unknown team'
                    : task.teamId?.name ?? 'Unknown team'
                }
              />
            ))}
          </div>
        </section>
      ) : user?.role === 'member' ? (
        <section>
          <h2>My Tasks by Status</h2>
          <div className="status-board">
            {(['todo', 'in_progress', 'review', 'done'] as const).map((status) => (
              <div key={status} className="status-column">
                <h3 className="section-title">{status.replace('_', ' ')}</h3>
                {myTasks.filter((task) => task.status === status).length === 0 && (
                  <p className="muted">No tasks</p>
                )}
                {myTasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div key={task._id} className="card task-card">
                      <div className="card-header">
                        <h3>{task.title}</h3>
                        <span className={`badge badge-${task.status}`}>{task.status}</span>
                      </div>
                      <p className="muted">{task.description ?? 'No description'}</p>
                      <div className="meta">
                        <span>
                          Team:{' '}
                          {typeof task.teamId === 'string'
                            ? teamMap.get(task.teamId) ?? 'Unknown team'
                            : task.teamId?.name ?? 'Unknown team'}
                        </span>
                        <span>Priority: {task.priority}</span>
                        <span>
                          Due:{' '}
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : 'No due date'}
                        </span>
                      </div>
                      <label className="muted">
                        Update status
                        <select
                          value={task.status}
                          disabled={updatingId === task._id}
                          onChange={async (e) => {
                            const nextStatus = e.target.value as TaskStatus;
                            setUpdatingId(task._id);
                            try {
                              await updateTask(task._id, { status: nextStatus });
                              setTasks((prev) =>
                                prev.map((item) =>
                                  item._id === task._id ? { ...item, status: nextStatus } : item
                                )
                              );
                            } finally {
                              setUpdatingId(null);
                            }
                          }}
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </label>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="grid">
          <section>
            <h2>My Tasks</h2>
            {myTasks.length === 0 && <p className="muted">No assigned tasks.</p>}
            <div className="task-board">
              {myTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  showActions={false}
                  teamName={
                    typeof task.teamId === 'string'
                      ? teamMap.get(task.teamId) ?? 'Unknown team'
                      : task.teamId?.name ?? 'Unknown team'
                  }
                />
              ))}
            </div>
          </section>
          <section>
            <h2>Team Tasks</h2>
            {teamTasks.length === 0 && <p className="muted">No team tasks yet.</p>}
            <div className="task-board">
              {teamTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  showActions={false}
                  teamName={
                    typeof task.teamId === 'string'
                      ? teamMap.get(task.teamId) ?? 'Unknown team'
                      : task.teamId?.name ?? 'Unknown team'
                  }
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
