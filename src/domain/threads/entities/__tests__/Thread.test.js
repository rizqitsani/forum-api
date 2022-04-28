const Thread = require('../Thread');

describe('a Thread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Dicoding Indonesia',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError(
      'THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: true,
      body: [],
      date: '23',
      username: {},
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError(
      'THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Dicoding Indonesia',
      body: 'Lorem ipsum dolor sit amet',
      date: '2022-04-04T07:19:09.775Z',
      username: 'user-123',
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread.id).toEqual(payload.id);
    expect(thread.owner).toEqual(payload.owner);
    expect(thread.title).toEqual(payload.title);
  });
});
