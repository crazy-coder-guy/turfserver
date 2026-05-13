export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('user_bookings', {
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
    slot_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'turf_slots',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    booking_date: {
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
    total_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending',
    },
    payment_status: {
      type: Sequelize.ENUM('unpaid', 'paid', 'refunded'),
      defaultValue: 'unpaid',
    },
    payment_method: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    transaction_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    razorpay_order_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    razorpay_payment_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    razorpay_signature: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    reminder_sent: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    review_reminder_sent: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
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

  await queryInterface.addIndex('user_bookings', ['user_id', 'booking_date']);
  await queryInterface.addIndex('user_bookings', ['razorpay_order_id']);
  await queryInterface.addIndex('user_bookings', ['status', 'reminder_sent', 'review_reminder_sent', 'booking_date', 'start_time', 'end_time'], {
    name: 'user_bookings_reminder_idx'
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('user_bookings');
};
