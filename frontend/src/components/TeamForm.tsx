import React, { useEffect, useState } from 'react';

interface TeamFormProps {
  onSubmit: (payload: { name: string; description?: string }) => Promise<void>;
  initial?: { name: string; description?: string } | null;
  onCancel?: () => void;
  creatorName?: string;
  memberOptions?: Array<{ _id: string; name: string; email: string }>;
  selectedMemberIds?: string[];
  onMembersChange?: (ids: string[]) => void;
}

const TeamForm = ({
  onSubmit,
  initial,
  onCancel,
  creatorName,
  memberOptions = [],
  selectedMemberIds = [],
  onMembersChange,
}: TeamFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? '');
    }
  }, [initial]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Team name is required');
      return;
    }
    setError(null);
    setLoading(true);
    await onSubmit({ name, description });
    if (!initial) {
      setName('');
      setDescription('');
    }
    setLoading(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit Team' : 'Create Team'}</h3>
      {error && <div className="error">{error}</div>}
      <label>
        Team Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      {onMembersChange && (
        <label>
          Members
          <select
            multiple
            value={selectedMemberIds}
            onChange={(e) =>
              onMembersChange(Array.from(e.target.selectedOptions, (option) => option.value))
            }
            size={Math.min(memberOptions.length, 8)}
          >
            {memberOptions.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
          {selectedMemberIds.length > 0 && (
            <div className="list">
              {selectedMemberIds.map((id) => {
                const member = memberOptions.find((option) => option._id === id);
                if (!member) return null;
                return (
                  <div className="card-actions" key={id}>
                    <span>
                      {member.name} ({member.email})
                    </span>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => onMembersChange(selectedMemberIds.filter((item) => item !== id))}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </label>
      )}
      <div className="card-actions">
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Save Changes' : 'Create Team'}
        </button>
        {onCancel && (
          <button className="btn secondary" type="button" onClick={onCancel}>
            Close
          </button>
        )}
      </div>
    </form>
  );
};

export default TeamForm;
