import logger, { stream } from '../../middleware/winston';

describe('Winston Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(logger, 'info').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(logger.info).toHaveBeenCalledWith('Test info message');
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(logger.error).toHaveBeenCalledWith('Test error message');
  });

  it('should provide a stream object with write method', () => {
    const spy = jest.spyOn(logger, 'info');
    stream.write('test log');
    expect(spy).toHaveBeenCalledWith('test log');
  });
}); 