import mongoose from 'mongoose';
import User from '../../models/userModel';

describe('User Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create & save user successfully', async () => {
    const validUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    const savedUser = await validUser.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.password).toBe(validUser.password);
    expect(savedUser.messages).toEqual([]);
    expect(savedUser.created_at).toBeDefined();
    expect(savedUser.updated_at).toBeDefined();
  });

  it('should fail to save user without required fields', async () => {
    const userWithoutRequiredField = new User({ username: 'testuser' });
    let err;
    
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save user with duplicate email', async () => {
    const user1 = new User({
      username: 'user1',
      email: 'test@example.com',
      password: 'password123',
    });
    await user1.save();

    const user2 = new User({
      username: 'user2',
      email: 'test@example.com',
      password: 'password456',
    });
    
    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000);
  });

  it('should trim whitespace from username, email, and password', async () => {
    const user = new User({
      username: '  testuser  ',
      email: '  test@example.com  ',
      password: '  password123  ',
    });
    const savedUser = await user.save();
    
    expect(savedUser.username).toBe('testuser');
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.password).toBe('password123');
  });

  it('should convert email to lowercase', async () => {
    const user = new User({
      username: 'testuser',
      email: 'TEST@EXAMPLE.COM',
      password: 'password123',
    });
    const savedUser = await user.save();
    
    expect(savedUser.email).toBe('test@example.com');
  });
}); 