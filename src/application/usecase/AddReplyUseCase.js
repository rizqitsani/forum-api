const AddReply = require('../../domain/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addReply = new AddReply(useCasePayload);

    await this._threadRepository.verifyThreadById(useCasePayload.threadId);
    await this._commentRepository.verifyCommentById(addReply.commentId);

    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
