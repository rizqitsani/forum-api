const { DatabaseError } = require('pg');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../common/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      await likeRepositoryPostgres.addLike(payload);

      // Assert
      const like = await LikesTableTestHelper.findLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      expect(like).toHaveLength(1);
    });

    it('should throw error when user is invalid', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action and Assert
      expect(likeRepositoryPostgres.addLike(payload)).rejects.toThrow(
        DatabaseError,
      );
      const like = await LikesTableTestHelper.findLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      expect(like).toHaveLength(0);
    });

    it('should throw error when comment is invalid', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action and Assert
      expect(likeRepositoryPostgres.addLike(payload)).rejects.toThrow(
        DatabaseError,
      );
      const like = await LikesTableTestHelper.findLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      expect(like).toHaveLength(0);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like correctly', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await LikesTableTestHelper.addLike(payload);

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      await likeRepositoryPostgres.deleteLike(payload);

      const deletedLike = (
        await LikesTableTestHelper.findLike({
          commentId: 'comment-123',
          userId: 'user-123',
        })
      )[0];

      // Assert
      expect(deletedLike).toBeUndefined();
    });

    it('should return error if like is not found', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Assert
      expect(likeRepositoryPostgres.deleteLike(payload)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('verifyLike function', () => {
    it('should return true when like is found', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await LikesTableTestHelper.addLike(payload);

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action and Assert
      const hasLiked = await likeRepositoryPostgres.verifyLike(payload);
      expect(hasLiked).toBe(true);
    });

    it('should return false when like is not found', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action and Assert
      const hasLiked = await likeRepositoryPostgres.verifyLike(payload);
      expect(hasLiked).toBe(false);
    });
  });
});
