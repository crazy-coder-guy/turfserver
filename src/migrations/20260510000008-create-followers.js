export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('Followers', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    follower_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users', // Use lowercase 'users' as per the users table migration
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    following_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('Followers', ['follower_id', 'following_id'], {
    unique: true,
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('Followers');
};
