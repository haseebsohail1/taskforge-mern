import bcrypt from 'bcrypt';
import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'member' | 'lead' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tokenVersion: number;
  comparePassword: (candidate: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['member', 'lead', 'admin'], default: 'member' },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  return next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
