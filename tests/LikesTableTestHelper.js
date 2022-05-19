/* istanbul ignore file */
const pool = require('../src/infrastructure/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({ commentId = 'comment-123', userId = 'user-123' }) {
    const query = {
      text: 'INSERT INTO likes (owner, comment_id) VALUES($1, $2)',
      values: [userId, commentId],
    };

    await pool.query(query);
  },

  async findLike({ commentId, userId }) {
    const query = {
      text: 'SELECT * FROM likes WHERE owner = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
