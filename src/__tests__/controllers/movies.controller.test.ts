import { MockRequest, MockResponse, MockPool } from '../../types';
import {
  getMovies,
  getTopRatedMovies,
  getSeenMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie
} from '../../controllers/movies.controller';

describe('Movies Controller', () => {
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;
  let mockPool: MockPool;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { email: 'test@example.com' }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMovies', () => {
    it('should return all movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', description: 'Description 1' },
        { id: 2, title: 'Movie 2', description: 'Description 2' },
      ];

      mockPool.query.mockResolvedValue({ rows: mockMovies });

      await getMovies(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM movies');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await getMovies(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error fetching movies',
      });
    });
  });

  describe('getMovieById', () => {
    it('should return a movie by id', async () => {
      const movieId = 1;
      mockRequest.params = { id: movieId.toString() };

      const mockMovie = { id: movieId, title: 'Movie 1', description: 'Description 1' };
      mockPool.query.mockResolvedValue({ rows: [mockMovie] });

      await getMovieById(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM movies WHERE id = $1', [movieId]);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovie);
    });

    it('should return 404 if movie not found', async () => {
      const movieId = 999;
      mockRequest.params = { id: movieId.toString() };

      mockPool.query.mockResolvedValue({ rows: [] });

      await getMovieById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Movie not found',
      });
    });
  });

  describe('addMovie', () => {
    it('should add a new movie', async () => {
      const movieData = {
        title: 'New Movie',
        description: 'New Description',
      };
      mockRequest.body = movieData;

      const mockMovie = { id: 1, ...movieData };
      mockPool.query.mockResolvedValue({ rows: [mockMovie] });

      await addMovie(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO movies (title, description) VALUES ($1, $2) RETURNING *',
        [movieData.title, movieData.description]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovie);
    });
  });

  describe('updateMovie', () => {
    it('should update a movie', async () => {
      const movieId = 1;
      const updateData = {
        title: 'Updated Movie',
        description: 'Updated Description',
      };
      mockRequest.params = { id: movieId.toString() };
      mockRequest.body = updateData;

      const mockMovie = { id: movieId, ...updateData };
      mockPool.query.mockResolvedValue({ rows: [mockMovie] });

      await updateMovie(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE movies SET title = $1, description = $2 WHERE id = $3 RETURNING *',
        [updateData.title, updateData.description, movieId]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovie);
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie', async () => {
      const movieId = 1;
      mockRequest.params = { id: movieId.toString() };

      mockPool.query.mockResolvedValue({ rows: [{ id: movieId }] });

      await deleteMovie(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM movies WHERE id = $1 RETURNING *', [movieId]);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Movie deleted successfully',
      });
    });
  });

  describe('getTopRatedMovies', () => {
    it('should return top rated movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', rating: 4.5 },
        { id: 2, title: 'Movie 2', rating: 4.0 },
      ];

      mockPool.query.mockResolvedValue({ rows: mockMovies });

      await getTopRatedMovies(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM movies ORDER BY rating DESC LIMIT 10');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await getTopRatedMovies(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error fetching top rated movies',
      });
    });
  });

  describe('getSeenMovies', () => {
    it('should return seen movies for a user', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', email: 'test@example.com' },
        { id: 2, title: 'Movie 2', email: 'test@example.com' },
      ];

      mockPool.query.mockResolvedValue({ rows: mockMovies });

      await getSeenMovies(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1',
        ['test@example.com']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await getSeenMovies(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error fetching seen movies',
      });
    });
  });
}); 