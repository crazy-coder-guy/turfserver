export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('reviews', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    turf_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'turfs',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    booking_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true, // One review per booking
      references: {
        model: 'user_bookings',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true,
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

  await queryInterface.addIndex('reviews', ['turf_id']);
  await queryInterface.addIndex('reviews', ['user_id']);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('reviews');
};
