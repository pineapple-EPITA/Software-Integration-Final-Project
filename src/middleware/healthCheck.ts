import express from 'express';
import type { Request, Response } from 'express-serve-static-core';

const router = express.Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router; 