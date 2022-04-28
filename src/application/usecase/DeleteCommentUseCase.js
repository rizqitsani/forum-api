const AuthorizationError = require('../../common/exceptions/AuthorizationError');

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { commentId, threadId, userId } = useCasePayload;

    await this._threadRepository.verifyThreadById(threadId);
    const owner = await this._commentRepository.getCommentOwner(commentId);

    if (owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
