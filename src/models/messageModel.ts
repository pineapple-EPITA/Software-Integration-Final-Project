import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  content?: string;
  user: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    content: {
      type: String,
      trim: true,
      minlength: [10, 'Content must be at least 10 characters long'],
      maxlength: [1000, 'Content cannot exceed 1000 characters'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message; 