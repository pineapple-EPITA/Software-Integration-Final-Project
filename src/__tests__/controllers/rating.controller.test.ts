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
      user: {},
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
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Missing parameters',
      });
    });

    it('should add rating and update movie rating successfully', async () => {
      const movieId = '123';
      const rating = 4.5;
      const userEmail = 'test@example.com';

      mockRequest.params = { movieId };
      mockRequest.body = { rating };
      mockRequest.user = { email: userEmail };

      const mockRatingObj = {
        save: jest.fn().mockResolvedValue({}),
      };
      (ratingModel as jest.Mock).mockImplementation(() => mockRatingObj);

      const mockRatings = [
        { rating: 4.5 },
        { rating: 3.5 },
        { rating: 5.0 },
      ];
      (ratingModel.find as jest.Mock).mockResolvedValue(mockRatings);

      (pool.query as jest.Mock).mockResolvedValue({});

      await addRating(mockRequest, mockResponse);

      expect(ratingModel).toHaveBeenCalledWith({
        email: userEmail,
        movie_id: 123,
        rating,
      });
      expect(mockRatingObj.save).toHaveBeenCalled();
      expect(ratingModel.find).toHaveBeenCalledWith({}, { rating });
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE movies SET rating = $1 WHERE movie_id = $2;',
        [4.33, 123]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Rating added',
      });
    });

    it('should handle database errors', async () => {
      const movieId = '123';
      const rating = 4.5;
      const userEmail = 'test@example.com';

      mockRequest.params = { movieId };
      mockRequest.body = { rating };
      mockRequest.user = { email: userEmail };

      const mockRatingObj = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (ratingModel as jest.Mock).mockImplementation(() => mockRatingObj);

      await addRating(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding rating',
      });
    });
  });
}); 