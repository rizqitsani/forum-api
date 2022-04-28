const AddCommentUseCase = require('../../../../application/usecase/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../application/usecase/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
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

  async deleteCommentHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );

    const { commentId, threadId } = request.params;

    await deleteCommentUseCase.execute({
      commentId,
      threadId,
      userId: request.auth.credentials.id,
    });

    return {
      status: 'success',
      message: 'Komentar berhasil dihapus',
    };
  }
}

module.exports = CommentsHandler;
