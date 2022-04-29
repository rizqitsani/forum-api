/* eslint-disable camelcase */
class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;

    this.content = payload.is_deleted
      ? '**balasan telah dihapus**'
      : payload.content;
  }

  _verifyPayload(payload) {
    const { id, content, is_deleted, username, date } = payload;

    if (
      !id ||
      !content ||
      Object.prototype.hasOwnProperty.call(payload, is_deleted) ||
      !username ||
      !date
    ) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof is_deleted !== 'boolean' ||
      typeof username !== 'string' ||
      typeof date !== 'string'
    ) {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
