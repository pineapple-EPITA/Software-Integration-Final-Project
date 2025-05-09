import mongoose from 'mongoose';
import MessageModel, { IMessage } from '../../models/messageModel';

declare global {
  var __MONGO_URI__: string;
}

describe('Message Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await MessageModel.deleteMany({});
  });

  it('should create & save message successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const validMessage = {
      name: 'Test Message',
      content: 'This is a test message that is long enough',
      user: userId,
    };

    const savedMessage = await MessageModel.create(validMessage) as IMessage & { _id: mongoose.Types.ObjectId };
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.name).toBe(validMessage.name);
    expect(savedMessage.content).toBe(validMessage.content);
    expect(savedMessage.user.toString()).toBe(userId.toString());
  });

  it('should fail to save message without required name', async () => {
    const userId = new mongoose.Types.ObjectId();
    const messageWithoutName = new MessageModel({
      content: 'This is a test message that is long enough',
      user: userId,
    });

    let err;
    try {
      await messageWithoutName.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });

  it('should fail to save message without required user', async () => {
    const messageWithoutUser = new MessageModel({
      name: 'Test Message',
      content: 'This is a test message that is long enough',
    });

    let err;
    try {
      await messageWithoutUser.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.user).toBeDefined();
  });

  it('should fail to save message with short name', async () => {
    const userId = new mongoose.Types.ObjectId();
    const messageWithShortName = new MessageModel({
      name: 'Te',
      content: 'This is a test message that is long enough',
      user: userId,
    });

    let err;
    try {
      await messageWithShortName.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });

  it('should fail to save message with too long name', async () => {
    const userId = new mongoose.Types.ObjectId();
    const longName = 'a'.repeat(101);
    const messageWithLongName = new MessageModel({
      name: longName,
      content: 'This is a test message that is long enough',
      user: userId,
    });

    let err;
    try {
      await messageWithLongName.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });

  it('should fail to save message with short content', async () => {
    const userId = new mongoose.Types.ObjectId();
    const messageWithShortContent = new MessageModel({
      name: 'Test Message',
      content: 'short',
      user: userId,
    });

    let err;
    try {
      await messageWithShortContent.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.content).toBeDefined();
  });

  it('should fail to save message with too long content', async () => {
    const userId = new mongoose.Types.ObjectId();
    const longContent = 'a'.repeat(1001);
    const messageWithLongContent = new MessageModel({
      name: 'Test Message',
      content: longContent,
      user: userId,
    });

    let err;
    try {
      await messageWithLongContent.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.content).toBeDefined();
  });

  it('should save message without optional content', async () => {
    const userId = new mongoose.Types.ObjectId();
    const messageWithoutContent = {
      name: 'Test Message',
      user: userId,
    };

    const savedMessage = await MessageModel.create(messageWithoutContent) as IMessage & { _id: mongoose.Types.ObjectId };
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.name).toBe(messageWithoutContent.name);
    expect(savedMessage.content).toBeUndefined();
    expect(savedMessage.user.toString()).toBe(userId.toString());
  });
}); 