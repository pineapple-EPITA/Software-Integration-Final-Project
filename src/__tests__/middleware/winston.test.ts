import winston from 'winston';
import logger from '../../middleware/winston';

describe('Winston Logger', () => {
  let mockConsoleTransport: jest.SpyInstance;
  let mockFileTransport: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleTransport = jest.spyOn(winston.transports.Console.prototype, 'log');
    mockFileTransport = jest.spyOn(winston.transports.File.prototype, 'log');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have both console and file transports', () => {
    expect(logger.transports).toHaveLength(2);
    expect(logger.transports[0]).toBeInstanceOf(winston.transports.File);
    expect(logger.transports[1]).toBeInstanceOf(winston.transports.Console);
  });

  it('should log info messages to both transports', () => {
    const message = 'Test info message';
    logger.info(message);

    expect(mockConsoleTransport).toHaveBeenCalled();
    expect(mockFileTransport).toHaveBeenCalled();
  });

  it('should log error messages to both transports', () => {
    const message = 'Test error message';
    logger.error(message);

    expect(mockConsoleTransport).toHaveBeenCalled();
    expect(mockFileTransport).toHaveBeenCalled();
  });

  it('should have a stream write function', () => {
    expect(logger.stream).toBeDefined();
    expect(typeof logger.stream.write).toBe('function');
  });

  it('should write to info level through stream', () => {
    const message = 'Test stream message';
    logger.stream.write(message);

    expect(mockConsoleTransport).toHaveBeenCalled();
    expect(mockFileTransport).toHaveBeenCalled();
  });

  it('should not exit on error', () => {
    expect(logger.exitOnError).toBe(false);
  });
}); 