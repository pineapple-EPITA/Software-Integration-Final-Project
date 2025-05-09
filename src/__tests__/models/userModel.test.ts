import mongoose from 'mongoose';
import UserModel from '../../models/userModel';

describe('User Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it('should create & save user successfully', async () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const savedUser = await UserModel.create(validUser);
    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.password).toBe(validUser.password);
    expect(savedUser.messages).toEqual([]);
  });

  it('should fail to save user without required email', async () => {
    const userWithoutEmail = new UserModel({
      username: 'testuser',
      password: 'password123',
    });

    let err;
    try {
      await userWithoutEmail.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save user without required password', async () => {
    const userWithoutPassword = new UserModel({
      username: 'testuser',
      email: 'test@example.com',
    });

    let err;
    try {
      await userWithoutPassword.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save user with invalid email format', async () => {
    const userWithInvalidEmail = new UserModel({
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
    });

    let err;
    try {
      await userWithInvalidEmail.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  it('should fail to save user with short username', async () => {
    const userWithShortUsername = new UserModel({
      username: 'te',
      email: 'test@example.com',
      password: 'password123',
    });

    let err;
    try {
      await userWithShortUsername.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.username).toBeDefined();
  });

  it('should fail to save user with short password', async () => {
    const userWithShortPassword = new UserModel({
      username: 'testuser',
      email: 'test@example.com',
      password: '12345',
    });

    let err;
    try {
      await userWithShortPassword.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.password).toBeDefined();
  });

  it('should fail to save duplicate email', async () => {
    const validUser = {
      username: 'testuser1',
      email: 'test@example.com',
      password: 'password123',
    };

    await UserModel.create(validUser);

    const duplicateUser = new UserModel({
      username: 'testuser2',
      email: 'test@example.com',
      password: 'password456',
    });

    let err;
    try {
      await duplicateUser.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });
}); 