import { MockRequest, MockResponse } from '../../types';
import { addMessage, getMessages, editMessage, deleteMessage } from '../../controllers/messages.controller';
import Message from '../../models/messageModel';

interface MessageData {
  _id?: string;
  name?: string;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

describe('Messages Controller', () => {
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMessage', () => {
    it('should create a new message successfully', async () => {
      const messageData: MessageData = {
        name: 'Test Message',
        user: {
          _id: '123',
          username: 'testuser',
          email: 'test@example.com',
        },
      };
      mockRequest.body = messageData;

      const mockMessage = {
        ...messageData,
        save: jest.fn().mockResolvedValue(messageData),
      };

      const MessageMock = Message as unknown as jest.Mock;
      MessageMock.mockImplementation(() => mockMessage);

      await addMessage(mockRequest, mockResponse);

      expect(Message).toHaveBeenCalledWith(messageData);
      expect(mockMessage.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(messageData);
    });

    it('should handle errors when creating a message', async () => {
      const messageData: MessageData = {
        name: 'Test Message',
        user: {
          _id: '123',
          username: 'testuser',
          email: 'test@example.com',
        },
      };
      mockRequest.body = messageData;

      const mockMessage = {
        ...messageData,
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      const MessageMock = Message as unknown as jest.Mock;
      MessageMock.mockImplementation(() => mockMessage);

      await addMessage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error creating message',
      });
    });
  });

  describe('getMessages', () => {
    it('should return all messages', async () => {
      const mockMessages: MessageData[] = [
        {
          name: 'Message 1',
          user: {
            _id: '123',
            username: 'user1',
            email: 'user1@example.com',
          },
        },
        {
          name: 'Message 2',
          user: {
            _id: '456',
            username: 'user2',
            email: 'user2@example.com',
          },
        },
      ];

      jest.spyOn(Message, 'find').mockResolvedValue(mockMessages);

      await getMessages(mockRequest, mockResponse);

      expect(Message.find).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMessages);
    });
  });
}); 