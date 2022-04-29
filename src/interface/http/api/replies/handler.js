const AddReplyUseCase = require('../../../../application/usecase/AddReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
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
}

module.exports = RepliesHandler;
