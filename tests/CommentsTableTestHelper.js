/* istanbul ignore file */
const pool = require('../src/infrastructure/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'Lorem ipsum dolor sit amet',
    owner = 'user-123',
    threadId = 'thread-123',
  }) {
    const query = {
      text: 'INSERT INTO comments (id, content, owner, thread_id) VALUES($1, $2, $3, $4)',
      values: [id, content, owner, threadId],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
