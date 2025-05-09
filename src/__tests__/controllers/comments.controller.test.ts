import mongoose from 'mongoose';
import { Response } from 'express';
import { CustomRequest, CommentRequestBody } from '../../types/test';
import { addComment, getCommentsById } from '../../controllers/comments.controller';
import Comment from '../../models/commentModel';
import { createMockRequest, createMockResponse } from '../utils';

interface CommentData extends CommentRequestBody {
  _id?: mongoose.Types.ObjectId;
  movie_id: number;
  downvotes: number;
  upvotes: number;
  save?: () => Promise<CommentData>;
}

describe('Comments Controller', () => {
  let mockRequest: Partial<CustomRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addComment', () => {
    it('should create a new comment successfully', async () => {
      const commentData: CommentData = {
        username: 'testuser',
        comment: 'Test comment',
        movie_id: 123,
        title: 'Test Movie',
        rating: 4,
        downvotes: 0,
        upvotes: 0,
      };
      mockRequest.body = commentData;
      mockRequest.params = { movie_id: '123' };

      const mockComment = {
        ...commentData,
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(commentData),
      };

      const CommentMock = Comment as unknown as jest.Mock;
      CommentMock.mockImplementation(() => mockComment);

      await addComment(mockRequest as CustomRequest, mockResponse as Response);

      expect(Comment).toHaveBeenCalledWith(commentData);
      expect(mockComment.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(commentData);
    });

    it('should handle errors when creating a comment', async () => {
      const commentData: CommentData = {
        username: 'testuser',
        comment: 'Test comment',
        movie_id: 123,
        title: 'Test Movie',
        rating: 4,
        downvotes: 0,
        upvotes: 0,
      };
      mockRequest.body = commentData;
      mockRequest.params = { movie_id: '123' };

      const mockComment = {
        ...commentData,
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      const CommentMock = Comment as unknown as jest.Mock;
      CommentMock.mockImplementation(() => mockComment);

      await addComment(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error creating comment',
      });
    });

    it('should validate required fields', async () => {
      const invalidCommentData = {
        username: 'testuser',
        // missing required fields
      };
      mockRequest.body = invalidCommentData;
      mockRequest.params = { movie_id: '123' };

      await addComment(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
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
          username: 'user1',
          comment: 'Comment 1',
          movie_id: movieId,
          title: 'Test Movie',
          rating: 4,
          downvotes: 0,
          upvotes: 0,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          username: 'user2',
          comment: 'Comment 2',
          movie_id: movieId,
          title: 'Test Movie',
          rating: 5,
          downvotes: 0,
          upvotes: 0,
        },
      ];

      jest.spyOn(Comment, 'find').mockResolvedValue(mockComments);

      await getCommentsById(mockRequest as CustomRequest, mockResponse as Response);

      expect(Comment.find).toHaveBeenCalledWith({ movie_id: movieId });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockComments);
    });

    it('should handle invalid movie ID', async () => {
      mockRequest.params = { movie_id: 'invalid' };

      await getCommentsById(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid movie ID',
      });
    });

    it('should handle database errors', async () => {
      const movieId = 123;
      mockRequest.params = { movie_id: movieId.toString() };

      jest.spyOn(Comment, 'find').mockRejectedValue(new Error('Database error'));

      await getCommentsById(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error fetching comments',
      });
    });
  });
}); 