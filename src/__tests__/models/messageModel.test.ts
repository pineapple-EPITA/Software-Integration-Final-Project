import mongoose from 'mongoose';
import Message from '../../models/messageModel';
import User from '../../models/userModel';

describe('Message Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Message.deleteMany({});
    await User.deleteMany({});
  });

  it('should create & save message successfully', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const message = new Message({
      name: 'Test Message',
      user: user._id,
    });
    const savedMessage = await message.save();
    
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.name).toBe(message.name);
    expect(savedMessage.user.toString()).toBe(user._id.toString());
    expect(savedMessage.created_at).toBeDefined();
    expect(savedMessage.updated_at).toBeDefined();
  });

  it('should fail to save message without required user reference', async () => {
    const messageWithoutUser = new Message({
      name: 'Test Message',
    });
    
    let err;
    try {
      await messageWithoutUser.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
  });

  it('should fail to save message with invalid user reference', async () => {
    const messageWithInvalidUser = new Message({
      name: 'Test Message',
      user: new mongoose.Types.ObjectId(),
    });
    
    let err;
    try {
      await messageWithInvalidUser.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
  });

  it('should populate user reference when requested', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const message = await Message.create({
      name: 'Test Message',
      user: user._id,
    });

    const populatedMessage = await Message.findById(message._id).populate('user');
    
    expect(populatedMessage.user).toBeDefined();
    expect(populatedMessage.user.username).toBe(user.username);
    expect(populatedMessage.user.email).toBe(user.email);
  });
}); 