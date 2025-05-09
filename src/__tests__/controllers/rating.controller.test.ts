// We need to move all mocks to the top before any imports or variable definitions
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn().mockResolvedValue({}),
    query: jest.fn().mockResolvedValue({ rows: [] }),
    on: jest.fn(),
    end: jest.fn(),
  };
  return {
    Pool: jest.fn(() => mPool),
    types: {
      setTypeParser: jest.fn(),
    },
  };
});

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
}));

// Create mocks that will be defined before being used in the jest.mock call
const dbMocks = {
  query: jest.fn(),
  connect: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({ rows: [] }),
    release: jest.fn()
  })
};

jest.mock('../../boot/database/db_connect', () => dbMocks);

jest.mock('../../models/ratingModel', () => {
  const mockRating = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  
  const MockRatingClass = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(true),
    _id: '123',
    rating: 4,
    movie_id: 123,
    email: 'test@example.com'
  }));
  
  Object.assign(MockRatingClass, mockRating);
  return MockRatingClass;
});

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
    // Cast mockResponse to any to avoid TypeScript errors
    mockResponse = createMockResponse() as any;
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

      // Mock pool query to return empty result (movie not found)
      dbMocks.query.mockResolvedValueOnce({ rows: [] });

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Movie not found'
      });
    });

    it('should return 400 if user has already rated the movie', async () => {
      mockRequest.params = { movieId: '123' };
      mockRequest.body = { rating: 4 };

      // Mock pool query to return a movie
      dbMocks.query.mockResolvedValueOnce({ rows: [{ movie_id: 123 }] });

      const existingRating = {
        _id: '123',
        rating: 4,
        movie_id: 123,
        email: 'test@example.com'
      };

      (Rating.findOne as jest.Mock).mockResolvedValue(existingRating);

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'You have already rated this movie'
      });
    });

    it('should add rating successfully', async () => {
      mockRequest.params = { movieId: '123' };
      mockRequest.body = { rating: 4 };

      // Mock pool query to return a movie
      dbMocks.query.mockResolvedValueOnce({ rows: [{ movie_id: 123 }] });

      // Mock client connection and queries
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn()
      };
      dbMocks.connect.mockResolvedValueOnce(mockClient);

      const mockRating = {
        _id: '123',
        rating: 4,
        movie_id: 123,
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      (Rating.findOne as jest.Mock).mockResolvedValue(null);
      (Rating.find as jest.Mock).mockResolvedValue([mockRating]);

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Rating added successfully'
      });
    });

    it('should handle database errors', async () => {
      mockRequest.params = { movieId: '123' };
      mockRequest.body = { rating: 4 };

      // Mock pool query to return a movie
      dbMocks.query.mockResolvedValueOnce({ rows: [{ movie_id: 123 }] });

      const mockError = new Error('Database error');
      (Rating.findOne as jest.Mock).mockRejectedValue(mockError);

      await addRating(mockRequest as RatingTestRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding rating'
      });
    });
  });
}); 