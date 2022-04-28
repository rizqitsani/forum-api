const { DatabaseError } = require('pg');

const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../common/exceptions/NotFoundError');
const AddedThread = require('../../../domain/threads/entities/AddedThread');
const AddThread = require('../../../domain/threads/entities/AddThread');
const Thread = require('../../../domain/threads/entities/Thread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        body: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        title: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123';

      await UsersTableTestHelper.addUser({});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const addedThread = await ThreadsTableTestHelper.findThreadsById(
        'thread-123',
      );
      expect(addedThread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        body: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        title: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123';

      await UsersTableTestHelper.addUser({});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Dicoding Indonesia',
          owner: 'user-123',
        }),
      );
    });

    it('should throw error 400 when user invalid', async () => {
      // Arrange
      const addThread = new AddThread({
        body: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        title: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action and Assert
      expect(threadRepositoryPostgres.addThread(addThread)).rejects.toThrow(
        DatabaseError,
      );
      const threads = await ThreadsTableTestHelper.findThreadsById(
        'thread-123',
      );
      expect(threads).toHaveLength(0);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      expect(
        threadRepositoryPostgres.getThreadById('thread-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should return thread data when it is found', async () => {
      // Arrange
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({
        id: threadId,
      });
      const expectedThread = (
        await ThreadsTableTestHelper.findThreadsById(threadId)
      )[0];

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(threadId);

      // Assert
      expect(thread).toBeInstanceOf(Thread);
      expect(thread.id).toBe(expectedThread.id);
      expect(thread.title).toBe(expectedThread.title);
      expect(thread.body).toBe(expectedThread.body);
      expect(thread.date).toBe(new Date(expectedThread.date).toISOString());
      expect(thread.username).toBe('dicoding');
    });
  });

  describe('verifyThreadById function', () => {
    it('should not throw error when thread is found', async () => {
      // Arrange
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({
        id: threadId,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      expect(
        threadRepositoryPostgres.verifyThreadById(threadId),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      expect(
        threadRepositoryPostgres.verifyThreadById('thread-123'),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
