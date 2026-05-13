export const up = async (queryInterface, Sequelize) => {
  const tableInfo = await queryInterface.describeTable('user_bookings');
  
  if (!tableInfo.review_reminder_sent) {
    await queryInterface.addColumn('user_bookings', 'review_reminder_sent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  }

  try {
    await queryInterface.removeIndex('user_bookings', 'user_bookings_reminder_idx');
  } catch (e) {
    // Index might not exist, ignore
  }

  await queryInterface.addIndex('user_bookings', ['status', 'reminder_sent', 'review_reminder_sent', 'booking_date', 'start_time', 'end_time'], {
    name: 'user_bookings_reminder_idx'
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('user_bookings', 'review_reminder_sent');
};
