const { DatabaseError } = require('pg');

const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../domain/threads/entities/AddedThread');
const AddThread = require('../../../domain/threads/entities/AddThread');
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
});
