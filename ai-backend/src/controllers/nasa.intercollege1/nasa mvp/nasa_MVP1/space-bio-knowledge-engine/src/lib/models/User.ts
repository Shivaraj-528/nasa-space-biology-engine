import { Schema, model, models } from 'mongoose';

export type UserRole = 'guest' | 'student' | 'teacher' | 'researcher' | 'scientist';

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    role: { type: String, enum: ['guest', 'student', 'teacher', 'researcher', 'scientist'], default: 'student' },
  },
  { timestamps: true }
);

const UserModel = models.User || model('User', UserSchema);
export default UserModel;
