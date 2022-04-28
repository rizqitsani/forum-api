const { DatabaseError } = require('pg');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../domain/comments/entities/AddComment');
const AddedComment = require('../../../domain/comments/entities/AddedComment');
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
});
