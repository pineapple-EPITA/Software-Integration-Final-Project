import mongoose from 'mongoose';
import Comment from '../../models/commentModel';

describe('Comment Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Comment.deleteMany({});
  });

  it('should create & save comment successfully', async () => {
    const validComment = new Comment({
      movie_id: 123,
      username: 'testuser',
      comment: 'Great movie!',
      title: 'My Review',
      rating: 4,
    });
    const savedComment = await validComment.save();
    
    expect(savedComment._id).toBeDefined();
    expect(savedComment.movie_id).toBe(validComment.movie_id);
    expect(savedComment.username).toBe(validComment.username);
    expect(savedComment.comment).toBe(validComment.comment);
    expect(savedComment.title).toBe(validComment.title);
    expect(savedComment.rating).toBe(validComment.rating);
    expect(savedComment.downvotes).toBe(0);
    expect(savedComment.upvotes).toBe(0);
    expect(savedComment.created_at).toBeDefined();
  });

  it('should fail to save comment without required fields', async () => {
    const commentWithoutRequiredFields = new Comment({
      username: 'testuser',
      comment: 'Great movie!',
    });
    
    let err;
    try {
      await commentWithoutRequiredFields.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save comment with invalid rating', async () => {
    const commentWithInvalidRating = new Comment({
      movie_id: 123,
      username: 'testuser',
      comment: 'Great movie!',
      title: 'My Review',
      rating: 6,
    });
    
    let err;
    try {
      await commentWithInvalidRating.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save comment with negative rating', async () => {
    const commentWithNegativeRating = new Comment({
      movie_id: 123,
      username: 'testuser',
      comment: 'Great movie!',
      title: 'My Review',
      rating: -1,
    });
    
    let err;
    try {
      await commentWithNegativeRating.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save comment with negative votes', async () => {
    const commentWithNegativeVotes = new Comment({
      movie_id: 123,
      username: 'testuser',
      comment: 'Great movie!',
      title: 'My Review',
      rating: 4,
      upvotes: -1,
      downvotes: -1,
    });
    
    let err;
    try {
      await commentWithNegativeVotes.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should update votes correctly', async () => {
    const comment = await Comment.create({
      movie_id: 123,
      username: 'testuser',
      comment: 'Great movie!',
      title: 'My Review',
      rating: 4,
    });

    comment.upvotes = 5;
    comment.downvotes = 2;
    const updatedComment = await comment.save();
    
    expect(updatedComment.upvotes).toBe(5);
    expect(updatedComment.downvotes).toBe(2);
  });
}); 