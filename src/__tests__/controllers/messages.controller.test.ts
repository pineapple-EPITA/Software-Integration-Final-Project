import mongoose from 'mongoose';
import {
  getMessages,
  getMessageById,
  addMessage,
  editMessage,
  deleteMessage,
} from '../../controllers/messages.controller';
import Message from '../../models/messageModel';

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
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Message 1',
          user: new mongoose.Types.ObjectId(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Message 2',
          user: new mongoose.Types.ObjectId(),
        },
      ];

      jest.spyOn(Message, 'find').mockResolvedValue(mockMessages);

      await getMessages(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMessages);
    });
  });

  describe('getMessageById', () => {
    it('should return message by id', async () => {
      const messageId = new mongoose.Types.ObjectId();
      mockRequest.params = { messageId };

      const mockMessage = {
        _id: messageId,
        name: 'Test Message',
        user: new mongoose.Types.ObjectId(),
      };

      jest.spyOn(Message, 'findById').mockResolvedValue(mockMessage);

      await getMessageById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMessage);
    });

    it('should handle database errors', async () => {
      const messageId = new mongoose.Types.ObjectId();
      mockRequest.params = { messageId };

      jest.spyOn(Message, 'findById').mockRejectedValue(new Error('Database error'));

      await getMessageById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error while getting message' });
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
      const userId = new mongoose.Types.ObjectId();
      mockRequest.session.user = { _id: userId };
      mockRequest.body = { message: { name: 'Test Message' } };

      const mockMessage = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Message',
        user: userId,
        save: jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Message',
          user: userId,
        }),
      };

      jest.spyOn(Message.prototype, 'save').mockResolvedValue(mockMessage);

      await addMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Message',
        user: userId,
      }));
    });

    it('should handle database errors', async () => {
      const userId = new mongoose.Types.ObjectId();
      mockRequest.session.user = { _id: userId };
      mockRequest.body = { message: { name: 'Test Message' } };

      jest.spyOn(Message.prototype, 'save').mockRejectedValue(new Error('Database error'));

      await addMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to add message' });
    });
  });

  describe('editMessage', () => {
    it('should return 400 if name or messageId is missing', async () => {
      await editMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should update message successfully', async () => {
      const messageId = new mongoose.Types.ObjectId();
      mockRequest.params = { messageId };
      mockRequest.body = { name: 'Updated Message' };

      const mockUpdatedMessage = {
        _id: messageId,
        name: 'Updated Message',
        user: new mongoose.Types.ObjectId(),
      };

      jest.spyOn(Message, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedMessage);

      await editMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedMessage);
    });

    it('should handle database errors', async () => {
      const messageId = new mongoose.Types.ObjectId();
      mockRequest.params = { messageId };
      mockRequest.body = { name: 'Updated Message' };

      jest.spyOn(Message, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'));

      await editMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to update message' });
    });
  });

  describe('deleteMessage', () => {
    it('should return 400 if messageId is missing', async () => {
      await deleteMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should delete message successfully', async () => {
      const messageId = new mongoose.Types.ObjectId();
      mockRequest.params = { messageId };

      jest.spyOn(Message, 'findByIdAndDelete').mockResolvedValue({ _id: messageId });

      await deleteMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Message deleted' });
    });

    it('should handle database errors', async () => {
      const messageId = new mongoose.Types.ObjectId();
      mockRequest.params = { messageId };

      jest.spyOn(Message, 'findByIdAndDelete').mockRejectedValue(new Error('Database error'));

      await deleteMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to delete message' });
    });
  });
}); 