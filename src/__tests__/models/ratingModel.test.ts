import mongoose from 'mongoose';
import Rating from '../../models/ratingModel';

describe('Rating Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Rating.deleteMany({});
  });

  it('should create & save rating successfully', async () => {
    const validRating = new Rating({
      movie_id: 123,
      email: 'test@example.com',
      rating: 4,
    });
    const savedRating = await validRating.save();
    
    expect(savedRating._id).toBeDefined();
    expect(savedRating.movie_id).toBe(validRating.movie_id);
    expect(savedRating.email).toBe(validRating.email);
    expect(savedRating.rating).toBe(validRating.rating);
    expect(savedRating.created_at).toBeDefined();
  });

  it('should fail to save rating without required fields', async () => {
    const ratingWithoutRequiredFields = new Rating({
      movie_id: 123,
    });
    
    let err;
    try {
      await ratingWithoutRequiredFields.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save rating with invalid rating value', async () => {
    const ratingWithInvalidValue = new Rating({
      movie_id: 123,
      email: 'test@example.com',
      rating: 6,
    });
    
    let err;
    try {
      await ratingWithInvalidValue.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save rating with negative rating value', async () => {
    const ratingWithNegativeValue = new Rating({
      movie_id: 123,
      email: 'test@example.com',
      rating: -1,
    });
    
    let err;
    try {
      await ratingWithNegativeValue.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should allow multiple ratings for same movie from different users', async () => {
    const rating1 = await Rating.create({
      movie_id: 123,
      email: 'user1@example.com',
      rating: 4,
    });

    const rating2 = await Rating.create({
      movie_id: 123,
      email: 'user2@example.com',
      rating: 5,
    });

    const ratings = await Rating.find({ movie_id: 123 });
    expect(ratings).toHaveLength(2);
    expect(ratings[0].email).toBe('user1@example.com');
    expect(ratings[1].email).toBe('user2@example.com');
  });
}); 