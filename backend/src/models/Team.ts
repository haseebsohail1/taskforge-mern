import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description?: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Team = mongoose.model<ITeam>('Team', teamSchema);
