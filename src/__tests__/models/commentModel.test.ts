import mongoose from 'mongoose';
import CommentModel, { IComment } from '../../models/commentModel';

declare global {
  namespace NodeJS {
    interface Global {
      __MONGO_URI__: string;
    }
  }
}

describe('Comment Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await CommentModel.deleteMany({});
  });

  it('should create & save comment successfully', async () => {
    const validComment = {
      movie_id: 123,
      rating: 4,
      username: 'testuser',
      comment: 'This is a test comment that is long enough',
      title: 'Test Comment Title',
    };

    const savedComment = await CommentModel.create(validComment) as IComment & { _id: mongoose.Types.ObjectId };
    expect(savedComment._id).toBeDefined();
    expect(savedComment.movie_id).toBe(validComment.movie_id);
    expect(savedComment.rating).toBe(validComment.rating);
    expect(savedComment.username).toBe(validComment.username);
    expect(savedComment.comment).toBe(validComment.comment);
    expect(savedComment.title).toBe(validComment.title);
  });

  it('should fail to save comment without required movie_id', async () => {
    const commentWithoutMovieId = new CommentModel({
      rating: 4,
      username: 'testuser',
      comment: 'This is a test comment that is long enough',
      title: 'Test Comment Title',
    });

    let err;
    try {
      await commentWithoutMovieId.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.movie_id).toBeDefined();
  });

  it('should fail to save comment with invalid rating', async () => {
    const commentWithInvalidRating = new CommentModel({
      movie_id: 123,
      rating: 6,
      username: 'testuser',
      comment: 'This is a test comment that is long enough',
      title: 'Test Comment Title',
    });

    let err;
    try {
      await commentWithInvalidRating.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.rating).toBeDefined();
  });

  it('should fail to save comment with short username', async () => {
    const commentWithShortUsername = new CommentModel({
      movie_id: 123,
      rating: 4,
      username: 'te',
      comment: 'This is a test comment that is long enough',
      title: 'Test Comment Title',
    });

    let err;
    try {
      await commentWithShortUsername.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.username).toBeDefined();
  });

  it('should fail to save comment with short comment', async () => {
    const commentWithShortComment = new CommentModel({
      movie_id: 123,
      rating: 4,
      username: 'testuser',
      comment: 'short',
      title: 'Test Comment Title',
    });

    let err;
    try {
      await commentWithShortComment.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.comment).toBeDefined();
  });

  it('should fail to save comment with short title', async () => {
    const commentWithShortTitle = new CommentModel({
      movie_id: 123,
      rating: 4,
      username: 'testuser',
      comment: 'This is a test comment that is long enough',
      title: 'Te',
    });

    let err;
    try {
      await commentWithShortTitle.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.title).toBeDefined();
  });

  it('should fail to save comment with too long comment', async () => {
    const longComment = 'a'.repeat(1001);
    const commentWithLongComment = new CommentModel({
      movie_id: 123,
      rating: 4,
      username: 'testuser',
      comment: longComment,
      title: 'Test Comment Title',
    });

    let err;
    try {
      await commentWithLongComment.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.comment).toBeDefined();
  });
}); 