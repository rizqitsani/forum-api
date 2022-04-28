const LoginTestHelper = {
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
};

module.exports = LoginTestHelper;
