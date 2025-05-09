import mongoose from 'mongoose';
import RatingModel, { IRating } from '../../models/ratingModel';

declare global {
  var __MONGO_URI__: string;
}

describe('Rating Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await RatingModel.deleteMany({});
  });

  it('should create & save rating successfully', async () => {
    const validRating = {
      email: 'test@example.com',
      movie_id: 123,
      rating: 4,
    };

    const savedRating = await RatingModel.create(validRating) as IRating & { _id: mongoose.Types.ObjectId };
    expect(savedRating._id).toBeDefined();
    expect(savedRating.email).toBe(validRating.email);
    expect(savedRating.movie_id).toBe(validRating.movie_id);
    expect(savedRating.rating).toBe(validRating.rating);
  });

  it('should fail to save rating without required email', async () => {
    const ratingWithoutEmail = new RatingModel({
      movie_id: 123,
      rating: 4,
    });

    let err;
    try {
      await ratingWithoutEmail.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  it('should fail to save rating without required movie_id', async () => {
    const ratingWithoutMovieId = new RatingModel({
      email: 'test@example.com',
      rating: 4,
    });

    let err;
    try {
      await ratingWithoutMovieId.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.movie_id).toBeDefined();
  });

  it('should fail to save rating without required rating value', async () => {
    const ratingWithoutValue = new RatingModel({
      email: 'test@example.com',
      movie_id: 123,
    });

    let err;
    try {
      await ratingWithoutValue.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.rating).toBeDefined();
  });

  it('should fail to save rating with invalid email format', async () => {
    const ratingWithInvalidEmail = new RatingModel({
      email: 'invalid-email',
      movie_id: 123,
      rating: 4,
    });

    let err;
    try {
      await ratingWithInvalidEmail.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  it('should fail to save rating with rating value less than 1', async () => {
    const ratingWithLowValue = new RatingModel({
      email: 'test@example.com',
      movie_id: 123,
      rating: 0,
    });

    let err;
    try {
      await ratingWithLowValue.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.rating).toBeDefined();
  });

  it('should fail to save rating with rating value greater than 5', async () => {
    const ratingWithHighValue = new RatingModel({
      email: 'test@example.com',
      movie_id: 123,
      rating: 6,
    });

    let err;
    try {
      await ratingWithHighValue.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.rating).toBeDefined();
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

    let err;
    try {
      await duplicateRating.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });
}); 