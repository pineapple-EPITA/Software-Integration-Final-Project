import mongoose from 'mongoose';
import User from '../../models/userModel';

describe('User Model Test', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create & save user successfully', async () => {
    const validUser = new User({
      email: 'test@example.com',
      password: 'password123',
    });
    const savedUser = await validUser.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.password).toBe(validUser.password);
  });

  it('should fail to save user without required fields', async () => {
    const userWithoutEmail = new User({ password: 'password123' });
    const userWithoutPassword = new User({ email: 'test@example.com' });

    let err: mongoose.Error.ValidationError;
    try {
      await userWithoutEmail.save();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }
    expect(err!).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err!.message).toBe(
      'User validation failed: email: Path `email` is required.',
    );

    try {
      await userWithoutPassword.save();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }
    expect(err!).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err!.message).toBe(
      'User validation failed: password: Path `password` is required.',
    );
  });

  it('should fail to save user with invalid email format', async () => {
    const userWithInvalidEmail = new User({
      email: 'invalid-email',
      password: 'password123',
    });

    let err: mongoose.Error.ValidationError;
    try {
      await userWithInvalidEmail.save();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }
    expect(err!).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err!.message).toContain('User validation failed');
  });

  it('should fail to save user with duplicate email', async () => {
    const user1 = new User({
      email: 'test@example.com',
      password: 'password123',
    });
    await user1.save();

    const user2 = new User({
      email: 'test@example.com',
      password: 'password456',
    });

    let err: mongoose.Error.ValidationError;
    try {
      await user2.save();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }
    expect(err!).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err!.message).toContain('User validation failed');
  });
});
