import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  movie_id: number;
  username: string;
  comment: string;
  title: string;
  rating: number;
  downvotes: number;
  upvotes: number;
  created_at: Date;
}

const commentSchema = new Schema<IComment>(
  {
    movie_id: {
      type: Number,
      required: [true, 'movie is required'],
    },
    username: {
      type: String,
      required: [true, 'username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    comment: {
      type: String,
      required: [true, 'comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters long'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      required: [true, 'rating is required'],
    },
    downvotes: {
      type: Number,
      min: 0,
      default: 0,
    },
    upvotes: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  },
);

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment; 