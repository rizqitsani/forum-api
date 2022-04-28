const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Lorem ipsum dolor sit amet',
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const threadId = await ServerTestHelper.addThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(
        requestPayload.content,
      );
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const threadId = await ServerTestHelper.addThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const threadId = await ServerTestHelper.addThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat komentar baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when missing access token', async () => {
      // Arrange
      const requestPayload = {
        content: 'Lorem ipsum dolor sit amet',
      };
      const requestHeader = {
        'Content-Type': 'application/json',
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const threadId = await ServerTestHelper.addThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'Lorem ipsum dolor sit amet',
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
        url: `/threads/asd/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and soft deleted comment', async () => {
      // Arrange
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const threadId = await ServerTestHelper.addThread(server, accessToken);
      const commentId = await ServerTestHelper.addComment(
        server,
        accessToken,
        threadId,
      );

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const comments = await CommentsTableTestHelper.findCommentsById(
        commentId,
      );
      expect(comments[0].is_deleted).toBe(true);
    });

    it('should response 401 when missing access token', async () => {
      // Arrange
      const requestHeader = {
        'Content-Type': 'application/json',
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const threadId = await ServerTestHelper.addThread(server, accessToken);
      const commentId = await ServerTestHelper.addComment(
        server,
        accessToken,
        threadId,
      );

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when user is not permitted', async () => {
      // Arrange
      const server = await createServer(container);
      const otherCommentId = 'comment-123';
      const otherUserId = 'user-123';

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const threadId = await ServerTestHelper.addThread(server, accessToken);
      const commentId = await ServerTestHelper.addComment(
        server,
        accessToken,
        threadId,
      );

      // Add comment from other user
      await UsersTableTestHelper.addUser({
        id: otherUserId,
        username: 'otheruser',
      });
      await CommentsTableTestHelper.addComment({
        id: otherCommentId,
        owner: otherUserId,
        threadId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${otherCommentId}`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.message).toEqual(
        'Anda tidak berhak mengakses resource ini',
      );

      const comments = await CommentsTableTestHelper.findCommentsById(
        commentId,
      );
      expect(comments[0].is_deleted).toBe(false);

      const otherComments = await CommentsTableTestHelper.findCommentsById(
        otherCommentId,
      );
      expect(otherComments[0].is_deleted).toBe(false);
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
        method: 'DELETE',
        url: `/threads/asd/comments/asd`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(server);
      const requestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const threadId = await ServerTestHelper.addThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/asd`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });
  });
});
