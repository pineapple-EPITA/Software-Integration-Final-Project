import { Response } from 'express';
import { CustomRequest } from '../../types/test';
import { getMovies, getMovieById, addMovie, updateMovie, deleteMovie, getTopRatedMovies, getSeenMovies } from '../../controllers/movies.controller';
import pool from '../../boot/database/db_connect';
import { createMockRequest, createMockResponse } from '../utils';

jest.mock('../../boot/database/db_connect', () => ({
  query: jest.fn(),
}));

describe('Movies Controller', () => {
  let mockRequest: Partial<CustomRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = createMockRequest({
      user: { email: 'test@example.com', _id: '123' }
    });
    mockResponse = createMockResponse() as any;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMovies', () => {
    it('should return all movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', description: 'Description 1' },
        { id: 2, title: 'Movie 2', description: 'Description 2' }
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockMovies });

      await getMovies(mockRequest as CustomRequest, mockResponse as Response);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM movies');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getMovies(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error fetching movies' });
    });
  });

  describe('getMovieById', () => {
    it('should return a movie by id', async () => {
      const mockMovie = { id: 1, title: 'Movie 1', description: 'Description 1' };
      mockRequest.params = { id: '1' };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockMovie] });

      await getMovieById(mockRequest as CustomRequest, mockResponse as Response);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM movies WHERE id = $1', [1]);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovie);
    });

    it('should return 404 if movie not found', async () => {
      mockRequest.params = { id: '999' };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await getMovieById(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Movie not found' });
    });
  });

  describe('addMovie', () => {
    it('should add a new movie', async () => {
      const newMovie = { title: 'New Movie', description: 'New Description' };
      mockRequest.body = newMovie;

      const mockResult = { id: 3, ...newMovie };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockResult] });

      await addMovie(mockRequest as CustomRequest, mockResponse as Response);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO movies (title, description) VALUES ($1, $2) RETURNING *',
        [newMovie.title, newMovie.description]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('updateMovie', () => {
    it('should update an existing movie', async () => {
      const updateData = { title: 'Updated Movie', description: 'Updated Description' };
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      const mockResult = { id: 1, ...updateData };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockResult] });

      await updateMovie(mockRequest as CustomRequest, mockResponse as Response);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE movies SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
        [updateData.title, updateData.description, 1]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie', async () => {
      mockRequest.params = { id: '1' };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1 }] });

      await deleteMovie(mockRequest as CustomRequest, mockResponse as Response);

      expect(pool.query).toHaveBeenCalledWith('DELETE FROM movies WHERE id = $1 RETURNING *', [1]);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie deleted successfully' });
    });
  });

  describe('getTopRatedMovies', () => {
    it('should return top rated movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', rating: 4.5 },
        { id: 2, title: 'Movie 2', rating: 4.0 }
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockMovies });

      await getTopRatedMovies(mockRequest as CustomRequest, mockResponse as Response);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM movies ORDER BY rating DESC LIMIT 10');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovies);
    });
  });

  describe('getSeenMovies', () => {
    it('should return seen movies for a user', async () => {
      const mockMovies = [
        { movie_id: 1, title: 'Movie 1' },
        { movie_id: 2, title: 'Movie 2' }
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockMovies });

      await getSeenMovies(mockRequest as CustomRequest, mockResponse as Response);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1',
        ['test@example.com']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getSeenMovies(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });
  });
}); 