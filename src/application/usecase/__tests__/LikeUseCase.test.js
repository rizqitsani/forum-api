const CommentRepository = require('../../../domain/comments/CommentRepository');
const LikeRepository = require('../../../domain/likes/LikeRepository');
const ThreadRepository = require('../../../domain/threads/ThreadRepository');
const LikeUseCase = require('../LikeUseCase');

describe('LikeUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the like action correctly if the current user does not like the comment yet', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLike = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const getLikeUseCase = new LikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(getLikeUseCase.execute(useCasePayload)).resolves.not.toThrow();
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentById).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.verifyLike).toBeCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
    expect(mockLikeRepository.addLike).toBeCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
  });

  it('should orchestrating the like action correctly if the current user already likes the comment', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLike = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const getLikeUseCase = new LikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(getLikeUseCase.execute(useCasePayload)).resolves.not.toThrow();
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentById).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.verifyLike).toBeCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
    expect(mockLikeRepository.deleteLike).toBeCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
  });
});
