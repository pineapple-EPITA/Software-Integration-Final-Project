import { Request, Response } from 'express';
import { Session } from 'express-session';
import { statusCodes } from '../constants/statusCodes';
import logger from '../middleware/winston';
import MessageModel from '../models/messageModel';

interface MessageRequestBody {
  message?: {
    name: string;
    content?: string;
  };
  name?: string;
}

interface UserSession extends Session {
  user?: {
    _id: string;
  };
}

interface CustomRequest extends Request {
  session: UserSession;
  params: {
    messageId?: string;
  };
  body: MessageRequestBody;
}

export const getMessages = async (_req: CustomRequest, res: Response): Promise<void> => {
  try {
    const messages = await MessageModel.find({});
    res.status(statusCodes.success).json(messages);
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : 'Unknown error');
    res.status(statusCodes.queryError).json({ error: 'Error while getting messages' });
  }
};

export const getMessageById = async (req: CustomRequest, res: Response): Promise<void> => {
  const { messageId } = req.params;

  if (!messageId) {
    res.status(statusCodes.badRequest).json({ error: 'Message ID is required' });
    return;
  }

  try {
    const message = await MessageModel.findById(messageId);
    if (!message) {
      res.status(statusCodes.notFound).json({ error: 'Message not found' });
      return;
    }
    res.status(statusCodes.success).json(message);
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : 'Unknown error');
    res.status(statusCodes.queryError).json({ error: 'Error while getting message' });
  }
};

export const addMessage = async (req: CustomRequest, res: Response): Promise<void> => {
  const { message } = req.body;

  if (!message || !message.name) {
    res.status(statusCodes.badRequest).json({ error: 'Message name is required' });
    return;
  }

  if (message.name.length < 3 || message.name.length > 100) {
    res.status(statusCodes.badRequest).json({ error: 'Message name must be between 3 and 100 characters' });
    return;
  }

  if (message.content && (message.content.length < 10 || message.content.length > 1000)) {
    res.status(statusCodes.badRequest).json({ error: 'Message content must be between 10 and 1000 characters' });
    return;
  }

  if (!req.session.user) {
    res.status(statusCodes.unauthorized).json({ error: 'You are not authenticated' });
    return;
  }

  try {
    const messageObj = new MessageModel({
      ...message,
      user: req.session.user._id,
    });
    await messageObj.save();
    res.status(statusCodes.success).json(messageObj);
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : 'Unknown error');
    res.status(statusCodes.queryError).json({ error: 'Failed to add message' });
  }
};

export const editMessage = async (req: CustomRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  const { messageId } = req.params;

  if (!name || !messageId) {
    res.status(statusCodes.badRequest).json({ error: 'Message name and ID are required' });
    return;
  }

  if (name.length < 3 || name.length > 100) {
    res.status(statusCodes.badRequest).json({ error: 'Message name must be between 3 and 100 characters' });
    return;
  }

  try {
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { name },
      { new: true },
    );
    if (!message) {
      res.status(statusCodes.notFound).json({ error: 'Message not found' });
      return;
    }
    res.status(statusCodes.success).json(message);
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : 'Unknown error');
    res.status(statusCodes.queryError).json({ error: 'Failed to update message' });
  }
};

export const deleteMessage = async (req: CustomRequest, res: Response): Promise<void> => {
  const { messageId } = req.params;

  if (!messageId) {
    res.status(statusCodes.badRequest).json({ error: 'Message ID is required' });
    return;
  }

  try {
    const message = await MessageModel.findByIdAndDelete(messageId);
    if (!message) {
      res.status(statusCodes.notFound).json({ error: 'Message not found' });
      return;
    }
    res.status(statusCodes.success).json({ message: 'Message deleted' });
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : 'Unknown error');
    res.status(statusCodes.queryError).json({ error: 'Failed to delete message' });
  }
}; 