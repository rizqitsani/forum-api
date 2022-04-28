class AddedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.owner = payload.owner;
    this.title = payload.title;
  }

  _verifyPayload(payload) {
    const { id, owner, title } = payload;

    if (!id || !owner || !title) {
      throw new Error('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof owner !== 'string' ||
      typeof title !== 'string'
    ) {
      throw new Error('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedThread;
