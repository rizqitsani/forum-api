const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      body: 'Lorem ipsum dolor sit amet',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      body: 123,
      owner: 'user-123',
      title: {},
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create addThread object correctly', () => {
    // Arrange
    const payload = {
      body: 'Lorem ipsum dolor sit amet',
      owner: 'user-123',
      title: 'Dicoding Indonesia',
    };

    // Action
    const addThread = new AddThread(payload);

    // Assert
    expect(addThread.body).toEqual(payload.body);
    expect(addThread.owner).toEqual(payload.owner);
    expect(addThread.title).toEqual(payload.title);
  });
});
