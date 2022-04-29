const CommentRepository = require('../../../domain/comments/CommentRepository');
const Comment = require('../../../domain/comments/entities/Comment');
const Reply = require('../../../domain/replies/entities/Reply');
const ReplyRepository = require('../../../domain/replies/ReplyRepository');
const Thread = require('../../../domain/threads/entities/Thread');
const ThreadRepository = require('../../../domain/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';

    const thread = new Thread({
      id: 'thread-123',
      title: 'Dicoding Indonesia',
      body: 'Lorem ipsum dolor sit amet',
      date: '2022-04-04T07:19:09.775Z',
      username: 'dicoding',
    });

    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'dicoding',
        content: 'Lorem ipsum dolor sit amet',
        date: '2022-04-04T07:19:09.775Z',
        is_deleted: false,
      }),
    ];

    const replies = [
      new Reply({
        id: 'reply-123',
        username: 'dicoding',
        content: 'Lorem ipsum dolor sit amet',
        date: '2022-04-04T07:19:09.775Z',
        is_deleted: false,
      }),
    ];

    comments[0].replies = replies;

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(thread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() =>
      Promise.resolve(comments),
    );
    mockReplyRepository.getRepliesByCommentId = jest.fn(() =>
      Promise.resolve(replies),
    );

    /** creating use case instance */
    const getThreadUseCase = new GetThreadDetailUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
    });

    const threadDetail = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload,
    );
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      comments[0].id,
    );
    expect(threadDetail).toBeInstanceOf(Thread);
    expect(threadDetail.id).toEqual(useCasePayload);
    expect(threadDetail.title).toEqual(thread.title);
    expect(threadDetail.body).toEqual(thread.body);
    expect(threadDetail.date).toEqual(thread.date);
    expect(threadDetail.username).toEqual(thread.username);
    expect(threadDetail.comments.length).toEqual(1);
    expect(threadDetail.comments).toEqual(comments);
    expect(threadDetail.comments[0].replies.length).toEqual(1);
    expect(threadDetail.comments[0].replies).toStrictEqual(replies);
  });
});
