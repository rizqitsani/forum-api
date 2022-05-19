exports.up = (pgm) => {
  pgm.createTable('likes', {
    owner: {
      type: 'VARCHAR(50)',
      primaryKey: true,
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('likes', 'fk_likes.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: {
        name: 'users',
        columns: 'id',
      },
    },
  });

  pgm.addConstraint('likes', 'fk_likes.comment_id_comments.id', {
    foreignKeys: {
      columns: 'comment_id',
      references: {
        name: 'comments',
        columns: 'id',
      },
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
