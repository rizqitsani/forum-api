const AuthorizationError = require('../../../common/exceptions/AuthorizationError');
const CommentRepository = require('../../../domain/comments/CommentRepository');
const ThreadRepository = require('../../../domain/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.getCommentOwner = jest.fn(() =>
      Promise.resolve('user-123'),
    );
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const getCommmentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(
      getCommmentUseCase.execute(useCasePayload),
    ).resolves.not.toThrow();
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.getCommentOwner).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.commentId,
    );
  });

  it('should throw error if user does not create the comment', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.getCommentOwner = jest.fn(() =>
      Promise.resolve('user-1234'),
    );
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const getCommmentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(getCommmentUseCase.execute(useCasePayload)).rejects.toThrow(
      AuthorizationError,
    );
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.getCommentOwner).toBeCalledWith(
      useCasePayload.commentId,
    );
  });
});
