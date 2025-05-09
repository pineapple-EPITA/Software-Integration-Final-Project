import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching movies' });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching movie' });
  }
};

export const addMovie = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const result = await pool.query(
      'INSERT INTO movies (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error adding movie' });
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const result = await pool.query(
      'UPDATE movies SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating movie' });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting movie' });
  }
};

export const getTopRatedMovies = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY rating DESC LIMIT 10');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching top rated movies' });
  }
};

export const getSeenMovies = async (req: Request, res: Response) => {
  try {
    const { email } = req.user as { email: string };
    const result = await pool.query(
      'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1',
      [email]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching seen movies' });
  }
}; 