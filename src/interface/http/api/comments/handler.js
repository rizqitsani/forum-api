const AddCommentUseCase = require('../../../../application/usecase/AddCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name,
    );

    const { threadId } = request.params;

    const addedComment = await addCommentUseCase.execute({
      owner: request.auth.credentials.id,
      threadId,
      ...request.payload,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = CommentsHandler;
