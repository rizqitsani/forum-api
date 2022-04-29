const CommentRepository = require('../../../domain/comments/CommentRepository');
const AddedReply = require('../../../domain/replies/entities/AddedReply');
const AddReply = require('../../../domain/replies/entities/AddReply');
const ReplyRepository = require('../../../domain/replies/ReplyRepository');
const ThreadRepository = require('../../../domain/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Lorem ipsum dolor sit amet',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };
    const expectedAddedReply = new AddedReply({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockReplyRepository.addReply = jest.fn(() =>
      Promise.resolve(expectedAddedReply),
    );
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const getReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await getReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentById).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply(useCasePayload),
    );
  });
});
