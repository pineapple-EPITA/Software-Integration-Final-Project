import mongoose from 'mongoose';
import { addComment, getCommentsById } from '../../controllers/comments.controller';
import commentModel from '../../models/commentModel';

jest.mock('../../middleware/winston', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../models/commentModel', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  })),
  find: jest.fn(),
}));

describe('Comments Controller', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addComment', () => {
    it('should return 400 if required fields are missing', async () => {
      mockRequest.params = { movie_id: '123' };
      mockRequest.body = {};

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should return 400 if movie_id is invalid', async () => {
      mockRequest.params = { movie_id: 'invalid' };
      mockRequest.body = {
        rating: 4.5,
        username: 'testuser',
        comment: 'Great movie!',
        title: 'Test Comment',
      };

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should add comment successfully', async () => {
      const movieId = '123';
      const commentData = {
        rating: 4.5,
        username: 'testuser',
        comment: 'Great movie!',
        title: 'Test Comment',
      };

      mockRequest.params = { movie_id: movieId };
      mockRequest.body = commentData;

      const mockCommentInstance = {
        save: jest.fn().mockResolvedValue({
          movie_id: 123,
          ...commentData,
        }),
      };
      (commentModel as jest.Mock).mockImplementation(() => mockCommentInstance);

      await addComment(mockRequest, mockResponse);

      expect(commentModel).toHaveBeenCalledWith({
        movie_id: 123,
        ...commentData,
      });
      expect(mockCommentInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Comment added' });
    });

    it('should handle database errors', async () => {
      const movieId = '123';
      const commentData = {
        rating: 4.5,
        username: 'testuser',
        comment: 'Great movie!',
        title: 'Test Comment',
      };

      mockRequest.params = { movie_id: movieId };
      mockRequest.body = commentData;

      const mockCommentInstance = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (commentModel as jest.Mock).mockImplementation(() => mockCommentInstance);

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding comment',
      });
    });
  });

  describe('getCommentsById', () => {
    it('should return 400 if movie_id is missing or invalid', async () => {
      mockRequest.params = { movie_id: 'invalid' };

      await getCommentsById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'movie id missing' });
    });

    it('should return comments for a valid movie_id', async () => {
      const movieId = '123';
      mockRequest.params = { movie_id: movieId };

      const mockComments = [
        {
          movie_id: 123,
          rating: 4.5,
          username: 'testuser1',
          comment: 'Great movie!',
          title: 'Test Comment 1',
        },
        {
          movie_id: 123,
          rating: 4.0,
          username: 'testuser2',
          comment: 'Good movie!',
          title: 'Test Comment 2',
        },
      ];

      (commentModel.find as jest.Mock).mockResolvedValue(mockComments);

      await getCommentsById(mockRequest, mockResponse);

      expect(commentModel.find).toHaveBeenCalledWith({ movie_id: 123 });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ comments: mockComments });
    });

    it('should handle database errors', async () => {
      const movieId = '123';
      mockRequest.params = { movie_id: movieId };

      (commentModel.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getCommentsById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occured while fetching comments',
      });
    });
  });
}); 