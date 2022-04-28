const AddedThread = require('../../domain/threads/entities/AddedThread');
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
}

module.exports = ThreadRepositoryPostgres;
