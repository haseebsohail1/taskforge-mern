import mongoose, { Document, Schema, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: Types.ObjectId;
  teamId: Types.ObjectId;
  dueDate?: Date;
  createdBy: Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);
