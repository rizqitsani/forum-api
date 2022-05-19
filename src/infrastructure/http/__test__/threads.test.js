const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
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
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
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
      const accessToken = await ServerTestHelper.getAccessToken(server);
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
      const accessToken = await ServerTestHelper.getAccessToken(server);
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
      const accessToken = await ServerTestHelper.getAccessToken(server);
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

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and returned thread', async () => {
      // Arrange
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);

      const threadId = await ServerTestHelper.addThread(server, accessToken);
      const commentId = await ServerTestHelper.addComment(
        server,
        accessToken,
        threadId,
      );
      const replyId = await ServerTestHelper.addReply(
        server,
        accessToken,
        threadId,
        commentId,
      );
      await ServerTestHelper.addLike(server, accessToken, threadId, commentId);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual('Dicoding Indonesia');
      expect(responseJson.data.thread.body).toEqual(
        'Lorem ipsum dolor sit amet',
      );
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments.length).toEqual(1);
      expect(responseJson.data.thread.comments[0].id).toEqual(commentId);
      expect(responseJson.data.thread.comments[0].replies.length).toEqual(1);
      expect(responseJson.data.thread.comments[0].replies[0].id).toEqual(
        replyId,
      );
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/asd',
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});
