const AuthorizationError = require('../../../common/exceptions/AuthorizationError');
const CommentRepository = require('../../../domain/comments/CommentRepository');
const ReplyRepository = require('../../../domain/replies/ReplyRepository');
const ThreadRepository = require('../../../domain/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      replyId: 'reply-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.getReplyOwner = jest.fn(() =>
      Promise.resolve('user-123'),
    );
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const getReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(
      getReplyUseCase.execute(useCasePayload),
    ).resolves.not.toThrow();
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentById).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.getReplyOwner).toBeCalledWith(
      useCasePayload.replyId,
    );
    expect(mockReplyRepository.deleteReply).toBeCalledWith(
      useCasePayload.replyId,
    );
  });

  it('should throw error if user does not create the comment', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      replyId: 'reply-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.getReplyOwner = jest.fn(() =>
      Promise.resolve('user-1234'),
    );
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const getReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(getReplyUseCase.execute(useCasePayload)).rejects.toThrow(
      AuthorizationError,
    );
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentById).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.getReplyOwner).toBeCalledWith(
      useCasePayload.replyId,
    );
  });
});
