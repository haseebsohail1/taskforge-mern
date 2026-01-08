import React from 'react';

import { Team } from '../types';

interface TeamCardProps {
  team: Team;
  onSelect: (team: Team) => void;
}

const TeamCard = ({ team, onSelect }: TeamCardProps) => (
  <div className="card" role="button" tabIndex={0} onClick={() => onSelect(team)}>
    <div className="card-header">
      <h3>{team.name}</h3>
      <span className="muted">{team.members.length} members</span>
    </div>
    {team.description && <p className="muted">{team.description}</p>}
  </div>
);

export default TeamCard;
