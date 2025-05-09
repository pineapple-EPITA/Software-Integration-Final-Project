import mongoose from 'mongoose';
import CommentModel from '../../models/commentModel';

describe('Comment Model Test', () => {
  beforeEach(async () => {
    await CommentModel.deleteMany({});
  });

  it('should create & save comment successfully', async () => {
    const validComment = new CommentModel({
      title: 'Test Comment Title',
      username: 'testuser',
      comment: 'This is a test comment with sufficient length',
      rating: 4,
      movie_id: new mongoose.Types.ObjectId().toString(),
    });

    const savedComment = await validComment.save();
    expect(savedComment._id).toBeDefined();
    expect(savedComment.title).toBe(validComment.title);
    expect(savedComment.username).toBe(validComment.username);
    expect(savedComment.comment).toBe(validComment.comment);
    expect(savedComment.rating).toBe(validComment.rating);
  });

  it('should fail to save comment without required fields', async () => {
    const commentWithoutMovieId = new CommentModel({
      rating: 5,
      username: 'testuser',
      comment: 'This is a test comment',
      title: 'Test Title',
    });

    try {
      await commentWithoutMovieId.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.movie_id).toBeDefined();
    }
  });

  it('should fail to save comment with invalid rating', async () => {
    const commentWithInvalidRating = new CommentModel({
      movie_id: '123',
      rating: 6,
      username: 'testuser',
      comment: 'This is a test comment',
      title: 'Test Title',
    });

    try {
      await commentWithInvalidRating.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.rating).toBeDefined();
    }
  });

  it('should fail to save comment with short username', async () => {
    const commentWithShortUsername = new CommentModel({
      movie_id: '123',
      rating: 5,
      username: 'te',
      comment: 'This is a test comment',
      title: 'Test Title',
    });

    try {
      await commentWithShortUsername.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.username).toBeDefined();
    }
  });

  it('should fail to save comment with short comment', async () => {
    const commentWithShortComment = new CommentModel({
      movie_id: '123',
      rating: 5,
      username: 'testuser',
      comment: 'short',
      title: 'Test Title',
    });

    try {
      await commentWithShortComment.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.comment).toBeDefined();
    }
  });

  it('should fail to save comment with short title', async () => {
    const commentWithShortTitle = new CommentModel({
      movie_id: '123',
      rating: 5,
      username: 'testuser',
      comment: 'This is a test comment',
      title: 'sh',
    });

    try {
      await commentWithShortTitle.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.title).toBeDefined();
    }
  });

  it('should fail to save comment with long comment', async () => {
    const commentWithLongComment = new CommentModel({
      movie_id: '123',
      rating: 5,
      username: 'testuser',
      comment: 'a'.repeat(501),
      title: 'Test Title',
    });

    try {
      await commentWithLongComment.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.comment).toBeDefined();
    }
  });
});
