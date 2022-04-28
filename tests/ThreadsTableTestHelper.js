/* istanbul ignore file */
const pool = require('../src/infrastructure/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123',
    body = 'Lorem ipsum dolor sit amet',
    owner = 'user-123',
    title = 'Dicoding Indonesia',
  }) {
    const query = {
      text: 'INSERT INTO threads (id, body, owner, title) VALUES($1, $2, $3, $4)',
      values: [id, body, owner, title],
    };

    await pool.query(query);
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
