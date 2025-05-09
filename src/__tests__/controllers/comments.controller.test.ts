import { jest } from '@jest/globals';
import type { Response } from 'express-serve-static-core';
import { Session, Cookie } from 'express-session';
import mongoose from 'mongoose';
import { CustomRequest } from '../../types/express';
import { addComment, getCommentsById } from '../../controllers/comments.controller';
import Comment from '../../models/commentModel';
import { createMockRequest, createMockResponse, castToResponse } from '../utils';

jest.mock('../../models/commentModel');

interface CommentData {
  _id?: mongoose.Types.ObjectId;
  movie_id: number;
  rating: number;
  username: string;
  comment: string;
  title: string;
  downvotes: number;
  upvotes: number;
  save?: () => Promise<CommentData>;
}

interface CommentRequestBody {
  movie_id: number;
  rating: number;
  username: string;
  comment: string;
  title: string;
}

interface UserSession extends Session {
  user?: {
    email: string;
    _id: string;
  };
}

interface CustomRequestWithBody extends CustomRequest {
  body: CommentRequestBody;
  session: UserSession;
}

describe('Comments Controller', () => {
  let mockRequest: CustomRequestWithBody;
  let mockResponse: Response;

  beforeEach(() => {
    const mockSession: UserSession = {
      id: 'test-session-id',
      cookie: {
        maxAge: 3600000,
        originalMaxAge: 3600000,
        expires: new Date(),
        secure: false,
        httpOnly: true,
        path: '/',
        domain: undefined,
        sameSite: 'lax'
      } as Cookie,
      regenerate: function(callback: (err: any) => void): UserSession {
        callback(null);
        return this;
      },
      destroy: function(callback: (err: any) => void): UserSession {
        callback(null);
        return this;
      },
      reload: function(callback: (err: any) => void): UserSession {
        callback(null);
        return this;
      },
      save: function(callback?: (err: any) => void): UserSession {
        if (callback) callback(null);
        return this;
      },
      touch: function(): UserSession {
        return this;
      },
      resetMaxAge: function(): UserSession {
        return this;
      }
    };

    mockRequest = createMockRequest({
      user: { email: 'test@example.com', _id: '123' },
      body: { 
        movie_id: 123,
        rating: 4,
        username: 'testuser',
        comment: 'This is a test comment',
        title: 'Test Movie'
      },
      session: mockSession
    }) as CustomRequestWithBody;
    mockResponse = castToResponse(createMockResponse());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addComment', () => {
    it('should create a new comment successfully', async () => {
      const commentData: CommentRequestBody = {
        movie_id: 123,
        rating: 4,
        username: 'testuser',
        comment: 'This is a test comment',
        title: 'Test Movie'
      };
      mockRequest.body = commentData;
      mockRequest.params = { movie_id: '123' };

      const mockComment: CommentData = {
        _id: new mongoose.Types.ObjectId(),
        movie_id: commentData.movie_id,
        rating: commentData.rating,
        username: commentData.username,
        comment: commentData.comment,
        title: commentData.title,
        downvotes: 0,
        upvotes: 0,
        save: jest.fn().mockImplementation(() => Promise.resolve(mockComment)) as () => Promise<CommentData>,
      };

      const CommentMock = Comment as unknown as jest.Mock;
      CommentMock.mockImplementation(() => mockComment);

      await addComment(mockRequest, mockResponse);

      expect(Comment).toHaveBeenCalledWith({
        movie_id: commentData.movie_id,
        rating: commentData.rating,
        username: commentData.username,
        comment: commentData.comment,
        title: commentData.title,
      });
      expect(mockComment.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Comment added',
      });
    });

    it('should handle database errors during comment creation', async () => {
      const commentData: CommentRequestBody = {
        movie_id: 123,
        rating: 4,
        username: 'testuser',
        comment: 'This is a test comment',
        title: 'Test Movie'
      };
      mockRequest.body = commentData;
      mockRequest.params = { movie_id: '123' };

      const mockComment: CommentData = {
        _id: new mongoose.Types.ObjectId(),
        movie_id: commentData.movie_id,
        rating: commentData.rating,
        username: commentData.username,
        comment: commentData.comment,
        title: commentData.title,
        downvotes: 0,
        upvotes: 0,
        save: jest.fn().mockRejectedValue(new Error('Database error') as never) as () => Promise<CommentData>,
      };

      const CommentMock = Comment as unknown as jest.Mock;
      CommentMock.mockImplementation(() => mockComment);

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding comment',
      });
    });

    it('should validate required fields', async () => {
      const invalidCommentData = {
        movie_id: 123,
        rating: 4,
        // missing required fields
      } as Partial<CommentRequestBody>;
      mockRequest.body = invalidCommentData as CommentRequestBody;
      mockRequest.params = { movie_id: '123' };

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing parameters',
      });
    });

    it('should validate rating range', async () => {
      const invalidCommentData: CommentRequestBody = {
        movie_id: 123,
        rating: 6, // invalid rating
        username: 'testuser',
        comment: 'This is a test comment',
        title: 'Test Movie'
      };
      mockRequest.body = invalidCommentData;
      mockRequest.params = { movie_id: '123' };

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Rating must be between 1 and 5',
      });
    });

    it('should validate username length', async () => {
      const invalidCommentData: CommentRequestBody = {
        movie_id: 123,
        rating: 4,
        username: 'te', // too short
        comment: 'This is a test comment',
        title: 'Test Movie'
      };
      mockRequest.body = invalidCommentData;
      mockRequest.params = { movie_id: '123' };

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Username must be between 3 and 50 characters',
      });
    });

    it('should validate title length', async () => {
      const invalidCommentData: CommentRequestBody = {
        movie_id: 123,
        rating: 4,
        username: 'testuser',
        comment: 'This is a test comment',
        title: 'Te', // too short
      };
      mockRequest.body = invalidCommentData;
      mockRequest.params = { movie_id: '123' };

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Title must be between 3 and 100 characters',
      });
    });

    it('should validate comment length', async () => {
      const invalidCommentData: CommentRequestBody = {
        movie_id: 123,
        rating: 4,
        username: 'testuser',
        comment: 'Too short', // too short
        title: 'Test Movie'
      };
      mockRequest.body = invalidCommentData;
      mockRequest.params = { movie_id: '123' };

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Comment must be between 10 and 1000 characters',
      });
    });
  });

  describe('getCommentsById', () => {
    it('should return all comments for a movie', async () => {
      const movieId = 123;
      mockRequest.params = { movie_id: movieId.toString() };

      const mockComments: CommentData[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          movie_id: movieId,
          rating: 4,
          username: 'user1',
          comment: 'Comment 1',
          title: 'Test Movie',
          downvotes: 0,
          upvotes: 0,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          movie_id: movieId,
          rating: 5,
          username: 'user2',
          comment: 'Comment 2',
          title: 'Test Movie',
          downvotes: 0,
          upvotes: 0,
        },
      ];

      jest.spyOn(Comment, 'find').mockResolvedValue(mockComments);

      await getCommentsById(mockRequest, mockResponse);

      expect(Comment.find).toHaveBeenCalledWith({ movie_id: movieId });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ comments: mockComments });
    });

    it('should handle invalid movie ID', async () => {
      mockRequest.params = { movie_id: 'invalid' };

      await getCommentsById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid movie ID',
      });
    });

    it('should handle database errors', async () => {
      const movieId = 123;
      mockRequest.params = { movie_id: movieId.toString() };

      jest.spyOn(Comment, 'find').mockRejectedValue(new Error('Database error'));

      await getCommentsById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while fetching comments',
      });
    });
  });
}); 