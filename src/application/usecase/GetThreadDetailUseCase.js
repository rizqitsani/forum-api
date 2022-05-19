class GetThreadDetailUseCase {
  constructor({
    commentRepository,
    likeRepository,
    replyRepository,
    threadRepository,
  }) {
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadById(useCasePayload);
    const comments = await this._commentRepository.getCommentsByThreadId(
      useCasePayload,
    );

    thread.comments = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getRepliesByCommentId(
          comment.id,
        );

        const likeCount = await this._likeRepository.getLikeCount(comment.id);

        return {
          ...comment,
          likeCount,
          replies,
        };
      }),
    );

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;
