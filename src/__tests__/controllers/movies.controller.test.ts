import { getMovies, getTopRatedMovies, getSeenMovies } from '../../controllers/movies.controller';
import pool from '../../boot/database/db_connect';

jest.mock('../../boot/database/db_connect', () => ({
  query: jest.fn(),
}));

describe('Movies Controller', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      query: {},
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

  describe('getMovies', () => {
    it('should return movies grouped by type when no category is specified', async () => {
      const mockMovies = [
        { movie_id: 1, type: 'action', title: 'Movie 1' },
        { movie_id: 2, type: 'action', title: 'Movie 2' },
        { movie_id: 3, type: 'comedy', title: 'Movie 3' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockMovies });

      await getMovies(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM movies GROUP BY type, movie_id;'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        movies: {
          action: [
            { movie_id: 1, type: 'action', title: 'Movie 1' },
            { movie_id: 2, type: 'action', title: 'Movie 2' },
          ],
          comedy: [
            { movie_id: 3, type: 'comedy', title: 'Movie 3' },
          ],
        },
      });
    });

    it('should return movies by category when category is specified', async () => {
      mockRequest.query = { category: 'action' };
      const mockMovies = [
        { movie_id: 1, type: 'action', title: 'Movie 1' },
        { movie_id: 2, type: 'action', title: 'Movie 2' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockMovies });

      await getMovies(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;',
        ['action']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ movies: mockMovies });
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getMovies(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occured while fetching movies',
      });
    });
  });

  describe('getTopRatedMovies', () => {
    it('should return top 10 rated movies', async () => {
      const mockMovies = [
        { movie_id: 1, title: 'Movie 1', rating: 9.5 },
        { movie_id: 2, title: 'Movie 2', rating: 9.0 },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockMovies });

      await getTopRatedMovies(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM movies ORDER BY rating DESC LIMIT 10;'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ movies: mockMovies });
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getTopRatedMovies(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occured while fetching top rated movies',
      });
    });
  });

  describe('getSeenMovies', () => {
    it('should return seen movies for a user', async () => {
      const mockMovies = [
        { movie_id: 1, title: 'Movie 1' },
        { movie_id: 2, title: 'Movie 2' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockMovies });

      await getSeenMovies(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1;',
        ['test@example.com']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ movies: mockMovies });
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getSeenMovies(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occured while fetching seen movies',
      });
    });
  });
}); 