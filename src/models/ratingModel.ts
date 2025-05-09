import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  movie_id: number;
  email: string;
  rating: number;
  created_at: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    movie_id: {
      type: Number,
      required: [true, 'movie is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      required: [true, 'rating is required'],
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  },
);

const Rating = mongoose.model<IRating>('Rating', ratingSchema);

export default Rating; 