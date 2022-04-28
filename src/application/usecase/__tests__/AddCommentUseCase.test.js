const CommentRepository = require('../../../domain/comments/CommentRepository');
const AddComment = require('../../../domain/comments/entities/AddComment');
const AddedComment = require('../../../domain/comments/entities/AddedComment');
const ThreadRepository = require('../../../domain/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Lorem ipsum dolor sit amet',
      owner: 'user-123',
      threadId: 'thread-123',
    };
    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.addComment = jest.fn(() =>
      Promise.resolve(expectedAddedComment),
    );
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const getCommmentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommmentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new AddComment(useCasePayload),
    );
  });
});
