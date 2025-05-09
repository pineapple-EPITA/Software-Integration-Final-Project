import mongoose from 'mongoose';
import { addComment, getCommentsById } from '../../controllers/comments.controller';
import Comment from '../../models/commentModel';

jest.mock('../../middleware/winston', () => ({
  info: jest.fn(),
  error: jest.fn(),
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
      mockRequest.body = {
        rating: 4,
        username: 'testuser',
      };

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should return 400 if movie_id is invalid', async () => {
      mockRequest.params = { movie_id: 'invalid' };
      mockRequest.body = {
        rating: 4,
        username: 'testuser',
        comment: 'Great movie!',
        title: 'My Review',
      };

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should add comment successfully', async () => {
      const commentData = {
        movie_id: '123',
        rating: 4,
        username: 'testuser',
        comment: 'Great movie!',
        title: 'My Review',
      };
      mockRequest.params = { movie_id: commentData.movie_id };
      mockRequest.body = {
        rating: commentData.rating,
        username: commentData.username,
        comment: commentData.comment,
        title: commentData.title,
      };

      const mockComment = {
        _id: new mongoose.Types.ObjectId(),
        ...commentData,
        movie_id: parseInt(commentData.movie_id),
        save: jest.fn().mockResolvedValue({ ...commentData, _id: new mongoose.Types.ObjectId() }),
      };

      jest.spyOn(Comment.prototype, 'save').mockResolvedValue(mockComment);

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Comment added' });
    });

    it('should handle database errors', async () => {
      mockRequest.params = { movie_id: '123' };
      mockRequest.body = {
        rating: 4,
        username: 'testuser',
        comment: 'Great movie!',
        title: 'My Review',
      };

      jest.spyOn(Comment.prototype, 'save').mockRejectedValue(new Error('Database error'));

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding comment',
      });
    });
  });

  describe('getCommentsById', () => {
    it('should return 400 if movie_id is missing', async () => {
      await getCommentsById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'movie id missing' });
    });

    it('should return 400 if movie_id is invalid', async () => {
      mockRequest.params = { movie_id: 'invalid' };

      await getCommentsById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'movie id missing' });
    });

    it('should return comments for valid movie_id', async () => {
      const movieId = '123';
      mockRequest.params = { movie_id: movieId };

      const mockComments = [
        {
          _id: new mongoose.Types.ObjectId(),
          movie_id: parseInt(movieId),
          rating: 4,
          username: 'testuser',
          comment: 'Great movie!',
          title: 'My Review',
        },
      ];

      jest.spyOn(Comment, 'find').mockResolvedValue(mockComments);

      await getCommentsById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ comments: mockComments });
    });

    it('should handle database errors', async () => {
      mockRequest.params = { movie_id: '123' };

      jest.spyOn(Comment, 'find').mockRejectedValue(new Error('Database error'));

      await getCommentsById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occured while fetching comments',
      });
    });
  });
}); 