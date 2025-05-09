import { addRating } from '../../controllers/rating.controller';
import pool from '../../boot/database/db_connect';
import ratingModel from '../../models/ratingModel';

jest.mock('../../boot/database/db_connect', () => ({
  query: jest.fn(),
}));

jest.mock('../../models/ratingModel', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  })),
  find: jest.fn(),
}));

describe('Rating Controller', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      user: { email: 'test@example.com' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addRating', () => {
    it('should return 400 if movieId is invalid or rating is missing', async () => {
      mockRequest.params = { movieId: 'invalid' };
      mockRequest.body = {};

      await addRating(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should add rating successfully and update movie rating', async () => {
      const movieId = '123';
      const rating = 4.5;
      mockRequest.params = { movieId };
      mockRequest.body = { rating };

      const mockRatings = [
        { rating: 4.5 },
        { rating: 3.5 },
        { rating: 5.0 },
      ];

      (ratingModel.find as jest.Mock).mockResolvedValue(mockRatings);
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await addRating(mockRequest, mockResponse);

      expect(ratingModel).toHaveBeenCalledWith({
        email: 'test@example.com',
        movie_id: 123,
        rating: 4.5,
      });
      expect(ratingModel.find).toHaveBeenCalledWith({}, { rating: 4.5 });
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE movies SET rating = $1 WHERE movie_id = $2;',
        [13, 123]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Rating added' });
    });

    it('should handle database errors during rating save', async () => {
      const movieId = '123';
      const rating = 4.5;
      mockRequest.params = { movieId };
      mockRequest.body = { rating };

      const mockRatingInstance = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (ratingModel as jest.Mock).mockImplementation(() => mockRatingInstance);

      await addRating(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding rating',
      });
    });

    it('should handle database errors during movie update', async () => {
      const movieId = '123';
      const rating = 4.5;
      mockRequest.params = { movieId };
      mockRequest.body = { rating };

      const mockRatings = [
        { rating: 4.5 },
        { rating: 3.5 },
        { rating: 5.0 },
      ];

      (ratingModel.find as jest.Mock).mockResolvedValue(mockRatings);
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await addRating(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding rating',
      });
    });
  });
}); 