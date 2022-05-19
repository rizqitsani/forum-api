class LikeUseCase {
  constructor({ commentRepository, likeRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { commentId, threadId, userId } = useCasePayload;

    await this._threadRepository.verifyThreadById(threadId);
    await this._commentRepository.verifyCommentById(commentId);

    const hasLiked = await this._likeRepository.verifyLike({
      commentId,
      userId,
    });

    if (hasLiked) {
      return this._likeRepository.deleteLike({ commentId, userId });
    }

    return this._likeRepository.addLike({ commentId, userId });
  }
}

module.exports = LikeUseCase;
