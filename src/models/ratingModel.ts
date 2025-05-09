import mongoose, { Document, Schema } from 'mongoose';

interface IRating extends Document {
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
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
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