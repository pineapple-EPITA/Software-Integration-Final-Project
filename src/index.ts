import 'dotenv/config';
import { startApp } from './boot/setup';
import logger from './middleware/winston';

const startServer = async (): Promise<void> => {
  try {
    startApp();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 