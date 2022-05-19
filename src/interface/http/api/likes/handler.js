const LikeUseCase = require('../../../../application/usecase/LikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request) {
    const likeUseCase = this._container.getInstance(LikeUseCase.name);

    const { commentId, threadId } = request.params;

    await likeUseCase.execute({
      commentId,
      threadId,
      userId: request.auth.credentials.id,
    });

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
