class AddThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.body = payload.body;
    this.owner = payload.owner;
    this.title = payload.title;
  }

  _verifyPayload(payload) {
    const { body, owner, title } = payload;

    if (!body || !owner || !title) {
      throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof body !== 'string' ||
      typeof owner !== 'string' ||
      typeof title !== 'string'
    ) {
      throw new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddThread;
