const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const LoginTestHelper = require('../../../../tests/LoginTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        body: 'Lorem ipsum dolor sit amet',
        title: 'Dicoding Indonesia',
      };
      const server = await createServer(container);
      const accessToken = await LoginTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const server = await createServer(container);
      const accessToken = await LoginTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        body: 'Lorem ipsum dolor sit amet',
        title: 123,
      };
      const server = await createServer(container);
      const accessToken = await LoginTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when missing access token', async () => {
      // Arrange
      const requestPayload = {
        body: 'Lorem ipsum dolor sit amet',
        title: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
