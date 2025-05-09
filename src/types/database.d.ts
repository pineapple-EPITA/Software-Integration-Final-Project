import { Pool } from 'pg';

declare module '*/db_connect' {
  const pool: Pool;
  export default pool;
}

export interface IRating {
  email: string;
  movie_id: number;
  rating: number;
  save(): Promise<void>;
}

export interface RatingModel {
  new(data: Partial<IRating>): IRating;
  find(query: any, projection?: any): Promise<IRating[]>;
}

declare module '*/ratingModel' {
  const model: RatingModel;
  export default model;
} 