export const up = async (queryInterface, Sequelize) => {
  // Drop old tables if they exist to start fresh with the unified table
  await queryInterface.dropTable('bookings', { cascade: true }).catch(() => {});
  await queryInterface.dropTable('slot_blocks', { cascade: true }).catch(() => {});
  await queryInterface.dropTable('turf_slots', { cascade: true }).catch(() => {});

  // Add price column to turfs if it doesn't exist
  await queryInterface.addColumn('turfs', 'price', {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
  }).catch(() => {});

  await queryInterface.createTable('turf_slots', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
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
    slot_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    end_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM('available', 'booked', 'blocked'),
      allowNull: false,
      defaultValue: 'available',
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: true,
    },
    created_by: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'turf_owners',
        key: 'id',
      },
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

  await queryInterface.addIndex('turf_slots', ['turf_id', 'slot_date']);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('turf_slots');
  await queryInterface.removeColumn('turfs', 'price').catch(() => {});
};
