const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
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
      const commentId = await ServerTestHelper.addComment(
        server,
        accessToken,
        threadId,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(
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
      const commentId = await ServerTestHelper.addComment(
        server,
        accessToken,
        threadId,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada',
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
      const commentId = await ServerTestHelper.addComment(
        server,
        accessToken,
        threadId,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat balasan baru karena tipe data tidak sesuai',
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
      const commentId = await ServerTestHelper.addComment(
        server,
        accessToken,
        threadId,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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
        url: `/threads/asd/comments/asd/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment is not found', async () => {
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
        url: `/threads/${threadId}/comments/asd/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and soft deleted reply', async () => {
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
      const replyId = await ServerTestHelper.addReply(
        server,
        accessToken,
        threadId,
        commentId,
      );

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies[0].is_deleted).toBe(true);
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
      const replyId = await ServerTestHelper.addReply(
        server,
        accessToken,
        threadId,
        commentId,
      );

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
      const otherReplyId = 'reply-123';
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
      const replyId = await ServerTestHelper.addReply(
        server,
        accessToken,
        threadId,
        commentId,
      );

      // Add reply from other user
      await UsersTableTestHelper.addUser({
        id: otherUserId,
        username: 'otheruser',
      });
      await RepliesTableTestHelper.addReply({
        id: otherReplyId,
        owner: otherUserId,
        commentId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${otherReplyId}`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.message).toEqual(
        'Anda tidak berhak mengakses resource ini',
      );

      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies[0].is_deleted).toBe(false);

      const otherReplies = await RepliesTableTestHelper.findRepliesById(
        otherReplyId,
      );
      expect(otherReplies[0].is_deleted).toBe(false);
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
        url: `/threads/asd/comments/asd/replies/asd`,
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
        url: `/threads/${threadId}/comments/asd/replies/asd`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 404 when reply is not found', async () => {
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
        url: `/threads/${threadId}/comments/${commentId}/replies/asd`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });
  });
});
