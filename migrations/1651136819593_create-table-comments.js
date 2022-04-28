exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      default: false,
      notNull: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('comments', 'fk_comments.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: {
        name: 'users',
        columns: 'id',
      },
    },
  });

  pgm.addConstraint('comments', 'fk_comments.thread_id_threads.id', {
    foreignKeys: {
      columns: 'thread_id',
      references: {
        name: 'threads',
        columns: 'id',
      },
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
