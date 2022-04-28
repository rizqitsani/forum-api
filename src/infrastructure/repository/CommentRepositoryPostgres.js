const NotFoundError = require('../../common/exceptions/NotFoundError');
const CommentRepository = require('../../domain/comments/CommentRepository');
const AddedComment = require('../../domain/comments/entities/AddedComment');
const Comment = require('../../domain/comments/entities/Comment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content, owner, threadId } = addComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments (id, content, owner, thread_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus komentar. Id tidak ditemukan');
    }
  }

  async getCommentById(commentId) {
    const query = {
      text: `SELECT comments.*, users.username FROM comments
      JOIN users ON users.id = comments.owner
      WHERE comments.id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    return new Comment({
      ...result.rows[0],
      date: new Date(result.rows[0].date).toISOString(),
    });
  }

  async getCommentOwner(commentId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    return result.rows[0].owner;
  }

  async verifyCommentById(commentId) {
    const query = {
      text: `SELECT id FROM comments WHERE id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
