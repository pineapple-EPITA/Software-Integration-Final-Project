import { MockRequest, MockResponse } from '../../types';
import { addComment, getCommentsById } from '../../controllers/comments.controller';
import Comment from '../../models/commentModel';

interface CommentData {
  _id?: string;
  username: string;
  comment: string;
  movie_id: number;
  title: string;
  rating: number;
  downvotes: number;
  upvotes: number;
}

describe('Comments Controller', () => {
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

  describe('addComment', () => {
    it('should create a new comment successfully', async () => {
      const commentData: CommentData = {
        username: 'testuser',
        comment: 'Test comment',
        movie_id: 123,
        title: 'Test Movie',
        rating: 4,
        downvotes: 0,
        upvotes: 0,
      };
      mockRequest.body = commentData;

      const mockComment = {
        ...commentData,
        save: jest.fn().mockResolvedValue(commentData),
      };

      const CommentMock = Comment as unknown as jest.Mock;
      CommentMock.mockImplementation(() => mockComment);

      await addComment(mockRequest, mockResponse);

      expect(Comment).toHaveBeenCalledWith(commentData);
      expect(mockComment.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(commentData);
    });

    it('should handle errors when creating a comment', async () => {
      const commentData: CommentData = {
        username: 'testuser',
        comment: 'Test comment',
        movie_id: 123,
        title: 'Test Movie',
        rating: 4,
        downvotes: 0,
        upvotes: 0,
      };
      mockRequest.body = commentData;

      const mockComment = {
        ...commentData,
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      const CommentMock = Comment as unknown as jest.Mock;
      CommentMock.mockImplementation(() => mockComment);

      await addComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error creating comment',
      });
    });
  });

  describe('getCommentsById', () => {
    it('should return all comments for a movie', async () => {
      const movieId = 123;
      mockRequest.params = { movieId: movieId.toString() };

      const mockComments: CommentData[] = [
        {
          username: 'user1',
          comment: 'Comment 1',
          movie_id: movieId,
          title: 'Test Movie',
          rating: 4,
          downvotes: 0,
          upvotes: 0,
        },
        {
          username: 'user2',
          comment: 'Comment 2',
          movie_id: movieId,
          title: 'Test Movie',
          rating: 5,
          downvotes: 0,
          upvotes: 0,
        },
      ];

      jest.spyOn(Comment, 'find').mockResolvedValue(mockComments);

      await getCommentsById(mockRequest, mockResponse);

      expect(Comment.find).toHaveBeenCalledWith({ movie_id: movieId });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockComments);
    });
  });
}); 