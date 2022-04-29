const { DatabaseError } = require('pg');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../common/exceptions/NotFoundError');
const AddComment = require('../../../domain/comments/entities/AddComment');
const AddedComment = require('../../../domain/comments/entities/AddedComment');
const Comment = require('../../../domain/comments/entities/Comment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const addedComment = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(addedComment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        addComment,
      );

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'Lorem ipsum dolor sit amet',
          owner: 'user-123',
        }),
      );
    });

    it('should throw error 400 when user is invalid', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action and Assert
      expect(commentRepositoryPostgres.addComment(addComment)).rejects.toThrow(
        DatabaseError,
      );
      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comments).toHaveLength(0);
    });

    it('should throw error 400 when thread is invalid', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action and Assert
      expect(commentRepositoryPostgres.addComment(addComment)).rejects.toThrow(
        DatabaseError,
      );
      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comments).toHaveLength(0);
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({ id: commentId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);
      const deletedComment = (
        await CommentsTableTestHelper.findCommentsById(commentId)
      )[0];

      // Assert
      expect(deletedComment.is_deleted).toEqual(true);
    });

    it('should return error if comment is not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Assert
      expect(
        commentRepositoryPostgres.deleteComment('comment-123'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCommentById function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(
        commentRepositoryPostgres.getCommentById('comment-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should return comment data when it is found', async () => {
      // Arrange
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({ id: commentId });
      const expectedComment = (
        await CommentsTableTestHelper.findCommentsById(commentId)
      )[0];

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById(commentId);

      // Assert
      expect(comment).toBeInstanceOf(Comment);
      expect(comment.id).toBe(expectedComment.id);
      expect(comment.title).toBe(expectedComment.title);
      expect(comment.body).toBe(expectedComment.body);
      expect(comment.date).toBe(new Date(expectedComment.date).toISOString());
      expect(comment.username).toBe('dicoding');
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comment data when it is found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const expectedComment = (
        await CommentsTableTestHelper.findCommentsById(commentId)
      )[0];

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId,
      );

      // Assert
      expect(comment).toHaveLength(1);
      expect(comment[0]).toBeInstanceOf(Comment);
      expect(comment[0].id).toBe(expectedComment.id);
      expect(comment[0].title).toBe(expectedComment.title);
      expect(comment[0].body).toBe(expectedComment.body);
      expect(comment[0].date).toBe(
        new Date(expectedComment.date).toISOString(),
      );
      expect(comment[0].username).toBe('dicoding');
    });
  });

  describe('getCommentOwner function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(
        commentRepositoryPostgres.getCommentOwner('comment-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should return comment owner when it is found', async () => {
      // Arrange
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({ id: commentId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const commentOwner = await commentRepositoryPostgres.getCommentOwner(
        commentId,
      );

      // Assert
      expect(commentOwner).toEqual('user-123');
    });
  });

  describe('verifyCommentById function', () => {
    it('should not throw error when comment is found', async () => {
      // Arrange
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({ id: commentId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(
        commentRepositoryPostgres.verifyCommentById(commentId),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(
        commentRepositoryPostgres.verifyCommentById('comment-123'),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
