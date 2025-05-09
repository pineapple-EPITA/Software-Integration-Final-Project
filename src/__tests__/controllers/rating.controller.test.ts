import { Response } from 'express';
import { CustomRequest } from '../../types/test';
import { addRating } from '../../controllers/rating.controller';
import { createMockRequest, createMockResponse } from '../utils';
import Rating from '../../models/ratingModel';

interface RatingTestRequest extends CustomRequest {
  params: {
    movieId: string;
  };
}

describe('Rating Controller', () => {
  let mockRequest: Partial<RatingTestRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    const baseRequest = createMockRequest({
      user: { email: 'test@example.com', _id: '123' },
      params: { movieId: '123' }
    });
    mockRequest = {
      ...baseRequest,
      params: { movieId: '123' }
    } as Partial<RatingTestRequest>;
    mockResponse = createMockResponse();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addRating', () => {
    it('should return 400 if movieId is invalid or rating is missing', async () => {
      mockRequest.params = { movieId: 'invalid' };
      mockRequest.body = {};

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing or invalid parameters'
      });
    });

    it('should return 400 if rating is out of range', async () => {
      mockRequest.params = { movieId: '123' };
      mockRequest.body = { rating: 6 };

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Rating must be between 1 and 5'
      });
    });

    it('should return 404 if movie not found', async () => {
      mockRequest.params = { movieId: '123' };
      mockRequest.body = { rating: 4 };

      const mockRating = {
        _id: '123',
        rating: 4,
        movie_id: 123,
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Rating, 'findOne').mockResolvedValue(null);
      const RatingMock = Rating as unknown as jest.Mock;
      RatingMock.mockImplementation(() => mockRating);

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Movie not found'
      });
    });

    it('should return 400 if user has already rated the movie', async () => {
      mockRequest.params = { movieId: '123' };
      mockRequest.body = { rating: 4 };

      const existingRating = {
        _id: '123',
        rating: 4,
        movie_id: 123,
        email: 'test@example.com'
      };

      jest.spyOn(Rating, 'findOne').mockResolvedValue(existingRating);

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'You have already rated this movie'
      });
    });

    it('should add rating successfully', async () => {
      mockRequest.params = { movieId: '123' };
      mockRequest.body = { rating: 4 };

      const mockRating = {
        _id: '123',
        rating: 4,
        movie_id: 123,
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Rating, 'findOne').mockResolvedValue(null);
      jest.spyOn(Rating, 'find').mockResolvedValue([mockRating]);
      const RatingMock = Rating as unknown as jest.Mock;
      RatingMock.mockImplementation(() => mockRating);

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Rating added successfully'
      });
    });

    it('should handle database errors', async () => {
      mockRequest.params = { movieId: '123' };
      mockRequest.body = { rating: 4 };

      const mockError = new Error('Database error');
      jest.spyOn(Rating, 'findOne').mockRejectedValue(mockError);

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding rating'
      });
    });
  });
}); 