import mongoose from 'mongoose';
import RatingModel from '../../models/ratingModel';

describe('Rating Model Test', () => {
  beforeEach(async () => {
    await RatingModel.deleteMany({});
  });

  it('should create & save rating successfully', async () => {
    const validRating = new RatingModel({
      movie_id: '123',
      rating: 5,
      email: 'test@example.com',
    });
    const savedRating = await validRating.save();
    expect(savedRating._id).toBeDefined();
    expect(savedRating.movie_id).toBe(validRating.movie_id);
    expect(savedRating.rating).toBe(validRating.rating);
    expect(savedRating.email).toBe(validRating.email);
  });

  it('should fail to save rating without required fields', async () => {
    const ratingWithoutMovieId = new RatingModel({
      rating: 5,
      email: 'test@example.com',
    });

    try {
      await ratingWithoutMovieId.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.movie_id).toBeDefined();
    }
  });

  it('should fail to save rating with invalid rating', async () => {
    const ratingWithInvalidRating = new RatingModel({
      movie_id: '123',
      rating: 6,
      email: 'test@example.com',
    });

    try {
      await ratingWithInvalidRating.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.rating).toBeDefined();
    }
  });

  it('should fail to save rating without email', async () => {
    const ratingWithoutEmail = new RatingModel({
      movie_id: '123',
      rating: 5,
    });

    try {
      await ratingWithoutEmail.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.email).toBeDefined();
    }
  });

  it('should fail to save rating without required email', async () => {
    const ratingWithoutEmail = new RatingModel({
      movie_id: 123,
      rating: 4,
    });

    try {
      await ratingWithoutEmail.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.email).toBeDefined();
    }
  });

  it('should fail to save rating with invalid email format', async () => {
    const ratingWithInvalidEmail = new RatingModel({
      email: 'invalid-email',
      movie_id: 123,
      rating: 4,
    });

    try {
      await ratingWithInvalidEmail.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.email).toBeDefined();
    }
  });

  it('should fail to save rating with rating value less than 1', async () => {
    const ratingWithLowValue = new RatingModel({
      email: 'test@example.com',
      movie_id: 123,
      rating: 0,
    });

    try {
      await ratingWithLowValue.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.rating).toBeDefined();
    }
  });

  it('should fail to save rating with rating value greater than 5', async () => {
    const ratingWithHighValue = new RatingModel({
      email: 'test@example.com',
      movie_id: 123,
      rating: 6,
    });

    try {
      await ratingWithHighValue.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.rating).toBeDefined();
    }
  });

  it('should fail to save duplicate rating for same movie and email', async () => {
    const validRating = {
      email: 'test@example.com',
      movie_id: 123,
      rating: 4,
    };

    await RatingModel.create(validRating);

    const duplicateRating = new RatingModel({
      email: 'test@example.com',
      movie_id: 123,
      rating: 5,
    });

    try {
      await duplicateRating.save();
      fail('Expected duplicate key error');
    } catch (error) {
      const err = error as { code: number };
      expect(err.code).toBe(11000); // MongoDB duplicate key error code
    }
  });
});
