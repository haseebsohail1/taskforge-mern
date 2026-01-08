import React, { useCallback, useEffect, useState } from 'react';

import TeamForm from '../components/TeamForm';
import { useAuth } from '../context/AuthContext';
import { addTeamMember, createTeam, deleteTeam, fetchTeams, updateTeam } from '../services/teams';
import { listUsers } from '../services/users';
import { Team } from '../types';

const TeamsPage = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selected, setSelected] = useState<Team | null>(null);
  const [editing, setEditing] = useState<Team | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberOptions, setMemberOptions] = useState<
    Array<{ _id: string; name: string; email: string; role: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTeams();
      setTeams(data);
      if (selected) {
        const refreshed = data.find((team) => team._id === selected._id) ?? null;
        setSelected(refreshed);
      }
      if (user?.role === 'admin') {
        const [members, leads] = await Promise.all([
          listUsers({ role: 'member', limit: 100 }),
          listUsers({ role: 'lead', limit: 50 }),
        ]);
        setMemberOptions([...members, ...leads]);
      } else if (user?.role === 'lead') {
        const memberMap = new Map<
          string,
          { _id: string; name: string; email: string; role: string }
        >();
        data.forEach((team) => {
          team.members.forEach((member) => {
            memberMap.set(member._id, member);
          });
        });
        setMemberOptions(Array.from(memberMap.values()));
      }
    } catch {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [selected, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveTeam = async (payload: { name: string; description?: string }) => {
    try {
      if (editing) {
        await updateTeam(editing._id, payload);
        const currentIds = new Set(editing.members.map((member) => member._id));
        const toAdd = selectedMemberIds.filter((id) => !currentIds.has(id));
        if (toAdd.length > 0) {
          await Promise.allSettled(toAdd.map((userId) => addTeamMember(editing._id, userId)));
        }
        setEditing(null);
        setShowForm(false);
      } else {
        if (user?.role !== 'admin') {
          throw new Error('Only admins can create teams');
        }
        await createTeam({ ...payload, memberIds: selectedMemberIds });
        setSelectedMemberIds([]);
        setShowForm(false);
      }
      await load();
    } catch {
      setError('Failed to save team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      if (selected?._id === teamId) {
        setSelected(null);
        setShowDetails(false);
      }
      await load();
    } catch {
      setError('Failed to delete team');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Teams</h1>
          <p className="muted">Manage teams and members.</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn" onClick={() => setShowForm(true)}>
            Create Team
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div>Loading teams...</div>
      ) : (
        <div className="table">
          <div className="table-row table-head">
            <span>Name</span>
            <span>Description</span>
            <span>Members</span>
            <span>Actions</span>
          </div>
          {teams.map((team) => (
            <div className="table-row" key={team._id}>
              <span>{team.name}</span>
              <span>{team.description ?? '-'}</span>
              <span>{team.members.length}</span>
              <div className="card-actions">
                <button
                  className="btn secondary"
                  onClick={() => {
                    setSelected(team);
                    setShowDetails(true);
                  }}
                >
                  View Details
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setEditing(team);
                    setSelectedMemberIds(team.members.map((member) => member._id));
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                {(user?.role === 'admin' ||
                  (user?.role === 'lead' && team.createdBy === user.id)) && (
                  <button className="btn danger" onClick={() => handleDeleteTeam(team._id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <TeamForm
              onSubmit={handleSaveTeam}
              initial={editing ? { name: editing.name, description: editing.description } : null}
              onCancel={() => {
                setEditing(null);
                setShowForm(false);
                setSelectedMemberIds([]);
              }}
              memberOptions={memberOptions.filter((member) => member._id !== user?.id)}
              selectedMemberIds={selectedMemberIds}
              onMembersChange={setSelectedMemberIds}
            />
          </div>
        </div>
      )}

      {showDetails && selected && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="card">
              <div className="card-header">
                <h3>{selected.name}</h3>
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
                  <p className="muted">Created By</p>
                  <p>
                    {typeof selected.createdBy === 'string'
                      ? selected.createdBy
                      : `${selected.createdBy.name} (${selected.createdBy.email})`}
                  </p>
                </div>
                <div>
                  <p className="muted">Created At</p>
                  <p>
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
              <h4 className="section-title">Members</h4>
              <div className="list">
                {selected.members.map((member) => (
                  <div key={member._id} className="card-actions">
                    <span>
                      {member.name} ({member.email})
                    </span>
                    <span className="muted">{member.role}</span>
                  </div>
                ))}
              </div>
              {(user?.role === 'admin' ||
                (user?.role === 'lead' && selected.createdBy === user.id)) && (
                <div className="card-actions">
                  <button className="btn danger" onClick={() => handleDeleteTeam(selected._id)}>
                    Delete Team
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
