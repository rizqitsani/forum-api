const AddComment = require('../../domain/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    await this._threadRepository.verifyThreadById(addComment.threadId);
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
