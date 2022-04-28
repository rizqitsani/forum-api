const NotFoundError = require('../../common/exceptions/NotFoundError');
const AddedThread = require('../../domain/threads/entities/AddedThread');
const Thread = require('../../domain/threads/entities/Thread');
const ThreadRepository = require('../../domain/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread) {
    const { body, title, owner } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads (id, body, owner, title) VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, body, owner, title],
    };

    const result = await this._pool.query(query);
    return new AddedThread({ ...result.rows[0] });
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT threads.*, users.username FROM threads
      JOIN users ON users.id = threads.owner
      WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return new Thread({
      ...result.rows[0],
      date: new Date(result.rows[0].date).toISOString(),
    });
  }

  async verifyThreadById(threadId) {
    const query = {
      text: `SELECT id FROM threads WHERE id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;
