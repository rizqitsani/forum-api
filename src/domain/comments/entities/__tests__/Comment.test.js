const Comment = require('../Comment');

describe('a Comment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      username: 'dicoding',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError(
      'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: {},
      date: '23',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError(
      'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2022-04-04T07:19:09.775Z',
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
  });
});
