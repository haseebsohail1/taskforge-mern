import React, { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { addTeamMember, fetchTeams } from '../services/teams';
import { api } from '../services/api';
import { createUser, listUsers, updateUserRole } from '../services/users';
import { Team } from '../types';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<
    Array<{ _id: string; name: string; email: string; role: string }>
  >([]);
  const [userSearch, setUserSearch] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as 'member' | 'lead',
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    try {
      const [teamData, userData, statsRes] = await Promise.all([
        fetchTeams(),
        listUsers({ limit: 50 }),
        api.get('/api/stats'),
      ]);
      setTeams(teamData);
      setUsers(userData);
      setTotalUsers(statsRes.data.data.totalUsers ?? null);
    } catch {
      setError('Failed to load admin dashboard data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUserSearch = async () => {
    setError(null);
    try {
      const results = await listUsers({ search: userSearch, limit: 50 });
      setUsers(results);
    } catch {
      setError('Failed to search users');
    }
  };

  const handleRoleChange = async (id: string, role: 'member' | 'lead' | 'admin') => {
    setError(null);
    try {
      const updated = await updateUserRole(id, role);
      setUsers((prev) => prev.map((user) => (user._id === updated._id ? updated : user)));
      setToast({ message: `Role updated for ${updated.name}`, type: 'success' });
    } catch {
      setError('Failed to update role');
      setToast({ message: 'Failed to update role', type: 'error' });
    }
  };

  const handleCreateUser = async () => {
    setError(null);
    try {
      const created = await createUser(newUser);
      setUsers((prev) => [created, ...prev]);
      setNewUser({ name: '', email: '', password: '', role: 'member' });
      setShowUserForm(false);
      setToast({ message: `User created: ${created.email}`, type: 'success' });
    } catch {
      setError('Failed to create user');
      setToast({ message: 'Failed to create user', type: 'error' });
    }
  };

  const handleAddToTeam = async (userId: string) => {
    if (!selectedTeam || !userId) {
      setError('Select a team first');
      return;
    }
    setError(null);
    try {
      await addTeamMember(selectedTeam, userId);
      await load();
    } catch {
      setError('Failed to add user to team');
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="page">
        <div className="card">Access restricted to admins.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admin Control Room</h1>
          <p className="muted">User operations, team access, and full task visibility.</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div className="card">
        <div className="list">
          <div className="card-actions">
            <button className="btn" type="button" onClick={() => setShowUserForm(true)}>
              Add User
            </button>
          </div>
          <div className="inline-input">
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name or email"
            />
            <button className="btn secondary" type="button" onClick={handleUserSearch}>
              Search
            </button>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
              <option value="">Assign to team...</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="card-actions">
            <span className="muted">Total users</span>
            <span>{totalUsers ?? '-'}</span>
          </div>
          <div className="table">
            <div className="table-row table-head">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Actions</span>
            </div>
            {users
              .filter((userItem) => userItem._id !== user.id)
              .map((userItem) => (
                <div className="table-row" key={userItem._id}>
                  <span>{userItem.name}</span>
                  <span>{userItem.email}</span>
                  <span>
                    <select
                      value={userItem.role}
                      disabled={userItem._id === user.id}
                      onChange={(e) =>
                        handleRoleChange(
                          userItem._id,
                          e.target.value as 'member' | 'lead' | 'admin'
                        )
                      }
                    >
                      <option value="member">Member</option>
                      <option value="lead">Lead</option>
                      <option value="admin">Admin</option>
                    </select>
                  </span>
                  <span>
                    <button
                      className="btn secondary"
                      type="button"
                      disabled={userItem._id === user.id}
                      onClick={() => handleAddToTeam(userItem._id)}
                    >
                      Add to Team
                    </button>
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {showUserForm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="card">
              <div className="card-header">
                <h3>Create User</h3>
                <button className="btn secondary" onClick={() => setShowUserForm(false)}>
                  Close
                </button>
              </div>
              <div className="form">
                <label>
                  Name
                  <input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </label>
                <label>
                  Role
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value as 'member' | 'lead' })
                    }
                  >
                    <option value="member">Member</option>
                    <option value="lead">Lead</option>
                  </select>
                </label>
                <div className="card-actions">
                  <button className="btn" type="button" onClick={handleCreateUser}>
                    Create User
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setShowUserForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
