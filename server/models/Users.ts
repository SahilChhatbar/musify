import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  spotifyId: string;
  email: string;
  displayName: string;
  profileImage?: string;
  refreshToken: string;
  lastLogin: Date;
}

const UserSchema = new Schema<IUser>({
  spotifyId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  profileImage: {
    type: String
  },
  refreshToken: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const User = model<IUser>('User', UserSchema);