const AuthorizationError = require('../../common/exceptions/AuthorizationError');

class DeleteReplyUseCase {
  constructor({ commentRepository, replyRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { commentId, replyId, threadId, userId } = useCasePayload;

    await this._threadRepository.verifyThreadById(threadId);
    await this._commentRepository.verifyCommentById(commentId);
    const owner = await this._replyRepository.getReplyOwner(replyId);

    if (owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
