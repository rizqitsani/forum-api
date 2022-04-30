const { DatabaseError } = require('pg');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../common/exceptions/NotFoundError');
const AddedReply = require('../../../domain/replies/entities/AddedReply');
const AddReply = require('../../../domain/replies/entities/AddReply');
const Reply = require('../../../domain/replies/entities/Reply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist reply and return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const addedReply = await RepliesTableTestHelper.findRepliesById(
        'reply-123',
      );
      expect(addedReply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'Lorem ipsum dolor sit amet',
          owner: 'user-123',
        }),
      );
    });

    it('should throw error when user is invalid', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action and Assert
      expect(replyRepositoryPostgres.addReply(addReply)).rejects.toThrow(
        DatabaseError,
      );
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(0);
    });

    it('should throw error when comment is invalid', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action and Assert
      expect(replyRepositoryPostgres.addReply(addReply)).rejects.toThrow(
        DatabaseError,
      );
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(0);
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({ id: replyId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);
      const deletedReply = (
        await RepliesTableTestHelper.findRepliesById(replyId)
      )[0];

      // Assert
      expect(deletedReply.is_deleted).toEqual(true);
    });

    it('should return error if reply is not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Assert
      expect(replyRepositoryPostgres.deleteReply('reply-123')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return comment data when it is found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await RepliesTableTestHelper.addReply({ id: replyId });

      const expectedReply = (
        await RepliesTableTestHelper.findRepliesById(replyId)
      )[0];

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        commentId,
      );

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toBeInstanceOf(Reply);
      expect(replies[0].id).toBe(expectedReply.id);
      expect(replies[0].content).toBe(expectedReply.content);
      expect(replies[0].date).toBe(new Date(expectedReply.date).toISOString());
      expect(replies[0].username).toBe('dicoding');
    });
  });

  describe('getReplyOwner function', () => {
    it('should throw NotFoundError when reply is not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      expect(
        replyRepositoryPostgres.getReplyOwner('reply-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should return reply owner when it is found', async () => {
      // Arrange
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({ id: replyId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replyOwner = await replyRepositoryPostgres.getReplyOwner(replyId);

      // Assert
      expect(replyOwner).toEqual('user-123');
    });
  });
});
