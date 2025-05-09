import * as winston from 'winston';
import logger, { stream } from '../../middleware/winston';

describe('Winston Logger', () => {
  const originalConsoleError = console.error;
  const mockConsoleError = jest.fn();

  beforeAll(() => {
    console.error = mockConsoleError;
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct log level', () => {
    expect(logger.level).toBe(process.env.LOG_LEVEL || 'info');
  });

  it('should have a console transport', () => {
    const transports = logger.transports as winston.transport[];
    expect(transports).toHaveLength(1);
    expect(transports[0]).toBeDefined();
  });

  it('should handle exceptions', () => {
    expect(logger.exceptions.handlers.size).toBe(1);
  });

  it('should log info messages', () => {
    const spy = jest.spyOn(logger, 'info');
    logger.info('Test info message');
    expect(spy).toHaveBeenCalledWith('Test info message');
  });

  it('should log error messages', () => {
    const spy = jest.spyOn(logger, 'error');
    const error = new Error('Test error');
    logger.error(error.stack);
    expect(spy).toHaveBeenCalledWith(error.stack);
  });

  it('should log warn messages', () => {
    const spy = jest.spyOn(logger, 'warn');
    logger.warn('Test warning message');
    expect(spy).toHaveBeenCalledWith('Test warning message');
  });

  describe('Morgan Stream', () => {
    it('should write log messages', () => {
      const spy = jest.spyOn(logger, 'info');
      stream.write('Test log message\n');
      expect(spy).toHaveBeenCalledWith('Test log message');
    });

    it('should handle error during write', () => {
      jest.spyOn(logger, 'info').mockImplementation(() => {
        throw new Error('Test error');
      });
      stream.write('Test log message\n');
      expect(mockConsoleError).toHaveBeenCalledWith('Error writing to log:', expect.any(Error));
    });

    it('should trim whitespace from log messages', () => {
      const spy = jest.spyOn(logger, 'info');
      stream.write('  Test log message  \n');
      expect(spy).toHaveBeenCalledWith('Test log message');
    });
  });
}); 