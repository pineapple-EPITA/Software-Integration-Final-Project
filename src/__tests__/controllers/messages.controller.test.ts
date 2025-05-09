import mongoose from 'mongoose';
import { Response } from 'express';
import { CustomRequest, UserSession } from '../../types/test';
import { addMessage, getMessages, editMessage, deleteMessage, getMessageById } from '../../controllers/messages.controller';
import Message from '../../models/messageModel';
import { createMockRequest, createMockResponse } from '../utils';

interface MessageData {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    user?: {
        _id: mongoose.Types.ObjectId;
        username: string;
        email: string;
    };
    save?: () => Promise<MessageData>;
}

describe('Messages Controller', () => {
    let mockRequest: Partial<CustomRequest>;
    let mockResponse: Partial<Response>;
    const userId = new mongoose.Types.ObjectId();

    beforeEach(() => {
        const mockSession = {
            user: {
                email: 'test@example.com',
                _id: userId.toString()
            }
        };

        mockRequest = createMockRequest({
            session: mockSession as UserSession
        });
        mockResponse = createMockResponse();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addMessage', () => {
        it('should create a new message successfully', async () => {
            const messageData: MessageData = {
                name: 'Test Message',
                user: {
                    _id: new mongoose.Types.ObjectId(),
                    username: 'testuser',
                    email: 'test@example.com',
                },
            };
            mockRequest.body = messageData;

            const mockMessage = {
                ...messageData,
                _id: new mongoose.Types.ObjectId(),
                save: jest.fn().mockResolvedValue(messageData),
            };

            const MessageMock = Message as unknown as jest.Mock;
            MessageMock.mockImplementation(() => mockMessage);

            await addMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(Message).toHaveBeenCalledWith(messageData);
            expect(mockMessage.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(messageData);
        });

        it('should handle errors when creating a message', async () => {
            const messageData: MessageData = {
                name: 'Test Message',
                user: {
                    _id: new mongoose.Types.ObjectId(),
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

            await addMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Error creating message',
            });
        });

        it('should validate required fields', async () => {
            const invalidMessageData = {
                // missing required fields
            };
            mockRequest.body = invalidMessageData;

            await addMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Missing required fields',
            });
        });
    });

    describe('getMessages', () => {
        it('should return all messages', async () => {
            const mockMessages: MessageData[] = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'Message 1',
                    user: {
                        _id: new mongoose.Types.ObjectId(),
                        username: 'user1',
                        email: 'user1@example.com',
                    },
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'Message 2',
                    user: {
                        _id: new mongoose.Types.ObjectId(),
                        username: 'user2',
                        email: 'user2@example.com',
                    },
                },
            ];

            jest.spyOn(Message, 'find').mockResolvedValue(mockMessages);

            await getMessages(mockRequest as CustomRequest, mockResponse as Response);

            expect(Message.find).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockMessages);
        });

        it('should handle database errors', async () => {
            jest.spyOn(Message, 'find').mockRejectedValue(new Error('Database error'));

            await getMessages(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Error fetching messages',
            });
        });
    });

    describe('editMessage', () => {
        it('should update message successfully', async () => {
            const messageId = new mongoose.Types.ObjectId();
            const updateData = {
                name: 'Updated Message',
            };
            mockRequest.params = { messageId: messageId.toString() };
            mockRequest.body = updateData;

            const originalMessage = {
                _id: messageId,
                name: 'Original Message',
                user: {
                    _id: new mongoose.Types.ObjectId(),
                    username: 'testuser',
                    email: 'test@example.com',
                },
            };

            const mockMessage = {
                ...originalMessage,
                save: jest.fn().mockResolvedValue({ ...originalMessage, ...updateData }),
            };

            jest.spyOn(Message, 'findById').mockResolvedValue(mockMessage);

            await editMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(Message.findById).toHaveBeenCalledWith(messageId);
            expect(mockMessage.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                ...originalMessage,
                ...updateData,
            });
        });

        it('should handle message not found', async () => {
            const messageId = new mongoose.Types.ObjectId();
            mockRequest.params = { messageId: messageId.toString() };

            jest.spyOn(Message, 'findById').mockResolvedValue(null);

            await editMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Message not found',
            });
        });

        it('should handle database errors', async () => {
            const messageId = new mongoose.Types.ObjectId();
            mockRequest.params = { messageId: messageId.toString() };

            jest.spyOn(Message, 'findById').mockRejectedValue(new Error('Database error'));

            await editMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Error updating message',
            });
        });
    });

    describe('deleteMessage', () => {
        it('should delete message successfully', async () => {
            const messageId = new mongoose.Types.ObjectId();
            mockRequest.params = { messageId: messageId.toString() };

            const mockMessage = {
                _id: messageId,
                name: 'Test Message',
                user: {
                    _id: new mongoose.Types.ObjectId(),
                    username: 'testuser',
                    email: 'test@example.com',
                },
                deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            };

            jest.spyOn(Message, 'findById').mockResolvedValue(mockMessage);

            await deleteMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(Message.findById).toHaveBeenCalledWith(messageId);
            expect(mockMessage.deleteOne).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Message deleted successfully',
            });
        });

        it('should handle message not found', async () => {
            const messageId = new mongoose.Types.ObjectId();
            mockRequest.params = { messageId: messageId.toString() };

            jest.spyOn(Message, 'findById').mockResolvedValue(null);

            await deleteMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Message not found',
            });
        });

        it('should handle database errors', async () => {
            const messageId = new mongoose.Types.ObjectId();
            mockRequest.params = { messageId: messageId.toString() };

            jest.spyOn(Message, 'findById').mockRejectedValue(new Error('Database error'));

            await deleteMessage(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Error deleting message',
            });
        });
    });

    describe('getMessageById', () => {
        it('should return message by id', async () => {
            const messageId = new mongoose.Types.ObjectId();
            mockRequest.params = { messageId: messageId.toString() };

            const mockMessage = {
                _id: messageId,
                name: 'Test Message',
                user: {
                    _id: new mongoose.Types.ObjectId(),
                    username: 'testuser',
                    email: 'test@example.com',
                },
            };

            jest.spyOn(Message, 'findById').mockResolvedValue(mockMessage);

            await getMessageById(mockRequest as CustomRequest, mockResponse as Response);

            expect(Message.findById).toHaveBeenCalledWith(messageId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockMessage);
        });

        it('should handle message not found', async () => {
            const messageId = new mongoose.Types.ObjectId();
            mockRequest.params = { messageId: messageId.toString() };

            jest.spyOn(Message, 'findById').mockResolvedValue(null);

            await getMessageById(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Message not found',
            });
        });

        it('should handle database errors', async () => {
            const messageId = new mongoose.Types.ObjectId();
            mockRequest.params = { messageId: messageId.toString() };

            jest.spyOn(Message, 'findById').mockRejectedValue(new Error('Database error'));

            await getMessageById(mockRequest as CustomRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Error fetching message',
            });
        });
    });
}); 