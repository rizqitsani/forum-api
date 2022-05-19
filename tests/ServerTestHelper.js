const ServerTestHelper = {
  async getAccessToken(server) {
    // register user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });
    const {
      data: { accessToken },
    } = JSON.parse(loginResponse.payload);

    return accessToken;
  },

  async addThread(server, token) {
    const requestThreadPayload = {
      title: 'Dicoding Indonesia',
      body: 'Lorem ipsum dolor sit amet',
    };

    const addThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestThreadPayload,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const {
      data: {
        addedThread: { id },
      },
    } = JSON.parse(addThreadResponse.payload);

    return id;
  },

  async addComment(server, token, threadId) {
    const requestCommentPayload = {
      content: 'Lorem ipsum dolor sit amet',
    };

    const addCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestCommentPayload,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const {
      data: {
        addedComment: { id },
      },
    } = JSON.parse(addCommentResponse.payload);

    return id;
  },

  async addReply(server, token, threadId, commentId) {
    const requestCommentPayload = {
      content: 'Lorem ipsum dolor sit amet',
    };

    const addCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: requestCommentPayload,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const {
      data: {
        addedReply: { id },
      },
    } = JSON.parse(addCommentResponse.payload);

    return id;
  },

  async addLike(server, token, threadId, commentId) {
    await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

module.exports = ServerTestHelper;
