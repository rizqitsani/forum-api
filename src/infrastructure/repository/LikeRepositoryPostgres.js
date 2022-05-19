const NotFoundError = require('../../common/exceptions/NotFoundError');
const LikeRepository = require('../../domain/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async addLike({ commentId, userId }) {
    const query = {
      text: 'INSERT INTO likes (owner, comment_id) VALUES($1, $2)',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async deleteLike({ commentId, userId }) {
    const query = {
      text: 'DELETE FROM likes WHERE owner = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus like. Id tidak ditemukan');
    }
  }

  async verifyLike({ commentId, userId }) {
    const query = {
      text: 'SELECT * FROM likes WHERE owner = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      return false;
    }

    return true;
  }
}

module.exports = LikeRepositoryPostgres;
