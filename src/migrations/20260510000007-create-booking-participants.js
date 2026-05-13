export const up = async (queryInterface, Sequelize) => {
  const tables = await queryInterface.showAllTables();
  if (tables.includes('booking_participants')) {
    console.log('Table booking_participants already exists, skipping creation.');
    return;
  }

  await queryInterface.createTable('booking_participants', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    booking_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'user_bookings',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    share_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('pending', 'paid'),
      defaultValue: 'pending',
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

  await queryInterface.addIndex('booking_participants', ['booking_id']);
  await queryInterface.addIndex('booking_participants', ['user_id']);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('booking_participants');
};
