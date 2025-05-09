import mongoose from 'mongoose';
import {
  getMessages,
  getMessageById,
  addMessage,
  editMessage,
  deleteMessage,
} from '../../controllers/messages.controller';
import Message from '../../models/messageModel';

jest.mock('../../models/messageModel', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  })),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

describe('Messages Controller', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      session: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should return all messages', async () => {
      const mockMessages = [
        { _id: '1', name: 'Message 1', user: 'user1' },
        { _id: '2', name: 'Message 2', user: 'user2' },
      ];

      (Message.find as jest.Mock).mockResolvedValue(mockMessages);

      await getMessages(mockRequest, mockResponse);

      expect(Message.find).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMessages);
    });
  });

  describe('getMessageById', () => {
    it('should return message by id', async () => {
      const messageId = '123';
      mockRequest.params = { messageId };

      const mockMessage = {
        _id: messageId,
        name: 'Test Message',
        user: 'user1',
      };

      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);

      await getMessageById(mockRequest, mockResponse);

      expect(Message.findById).toHaveBeenCalledWith(messageId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMessage);
    });

    it('should handle database errors', async () => {
      const messageId = '123';
      mockRequest.params = { messageId };

      (Message.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getMessageById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error while getting message',
      });
    });
  });

  describe('addMessage', () => {
    it('should return 400 if message name is missing', async () => {
      mockRequest.body = { message: {} };

      await addMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should return 500 if user is not authenticated', async () => {
      mockRequest.body = { message: { name: 'Test Message' } };

      await addMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'You are not authenticated' });
    });

    it('should add message successfully', async () => {
      const userId = 'user1';
      mockRequest.session.user = { _id: userId };
      mockRequest.body = { message: { name: 'Test Message' } };

      const mockMessage = {
        _id: '123',
        name: 'Test Message',
        user: userId,
        save: jest.fn().mockResolvedValue({
          _id: '123',
          name: 'Test Message',
          user: userId,
        }),
      };
      (Message as jest.Mock).mockImplementation(() => mockMessage);

      await addMessage(mockRequest, mockResponse);

      expect(Message).toHaveBeenCalledWith({
        name: 'Test Message',
        user: userId,
      });
      expect(mockMessage.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMessage);
    });

    it('should handle database errors', async () => {
      const userId = 'user1';
      mockRequest.session.user = { _id: userId };
      mockRequest.body = { message: { name: 'Test Message' } };

      const mockMessage = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (Message as jest.Mock).mockImplementation(() => mockMessage);

      await addMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to add message',
      });
    });
  });

  describe('editMessage', () => {
    it('should return 400 if name or messageId is missing', async () => {
      await editMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should update message successfully', async () => {
      const messageId = '123';
      mockRequest.params = { messageId };
      mockRequest.body = { name: 'Updated Message' };

      const mockUpdatedMessage = {
        _id: messageId,
        name: 'Updated Message',
        user: 'user1',
      };

      (Message.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedMessage);

      await editMessage(mockRequest, mockResponse);

      expect(Message.findByIdAndUpdate).toHaveBeenCalledWith(
        messageId,
        { name: 'Updated Message' },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedMessage);
    });

    it('should handle database errors', async () => {
      const messageId = '123';
      mockRequest.params = { messageId };
      mockRequest.body = { name: 'Updated Message' };

      (Message.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await editMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to update message',
      });
    });
  });

  describe('deleteMessage', () => {
    it('should return 400 if messageId is missing', async () => {
      await deleteMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should delete message successfully', async () => {
      const messageId = '123';
      mockRequest.params = { messageId };

      (Message.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: messageId });

      await deleteMessage(mockRequest, mockResponse);

      expect(Message.findByIdAndDelete).toHaveBeenCalledWith(messageId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Message deleted' });
    });

    it('should handle database errors', async () => {
      const messageId = '123';
      mockRequest.params = { messageId };

      (Message.findByIdAndDelete as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await deleteMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to delete message' });
    });
  });
}); 