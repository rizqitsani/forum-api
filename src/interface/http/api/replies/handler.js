const AddReplyUseCase = require('../../../../application/usecase/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../application/usecase/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const { commentId, threadId } = request.params;

    const addedReply = await addReplyUseCase.execute({
      owner: request.auth.credentials.id,
      commentId,
      threadId,
      ...request.payload,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name,
    );

    const { commentId, replyId, threadId } = request.params;

    await deleteReplyUseCase.execute({
      commentId,
      replyId,
      threadId,
      userId: request.auth.credentials.id,
    });

    return {
      status: 'success',
      message: 'Balasan berhasil dihapus',
    };
  }
}

module.exports = RepliesHandler;
