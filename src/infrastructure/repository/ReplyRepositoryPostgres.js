const NotFoundError = require('../../common/exceptions/NotFoundError');
const AddedReply = require('../../domain/replies/entities/AddedReply');
const Reply = require('../../domain/replies/entities/Reply');
const ReplyRepository = require('../../domain/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { content, owner, commentId } = addReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies (id, content, owner, comment_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus balasan. Id tidak ditemukan');
    }
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT replies.*, users.username FROM replies
      JOIN users ON users.id = replies.owner
      WHERE replies.comment_id = $1
      ORDER BY replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(
      (reply) =>
        new Reply({
          ...reply,
          date: new Date(reply.date).toISOString(),
        }),
    );
  }

  async getReplyOwner(replyId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    return result.rows[0].owner;
  }
}

module.exports = ReplyRepositoryPostgres;
