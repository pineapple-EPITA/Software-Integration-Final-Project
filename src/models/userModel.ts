import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  email: string;
  password: string;
  messages: mongoose.Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    messages: [{
      type: Schema.Types.ObjectId,
      ref: 'Message'
    }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const User = mongoose.model<IUser>('User', userSchema);

export default User; 