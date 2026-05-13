export const up = async (queryInterface, Sequelize) => {
  try {
    // Postgres specific: Add value to existing ENUM type
    // We use a try-catch because ADD VALUE cannot run inside a transaction in some Postgres versions,
    // and IF NOT EXISTS is only supported in newer Postgres versions for ADD VALUE.
    await queryInterface.sequelize.query('ALTER TYPE "enum_booking_participants_status" ADD VALUE IF NOT EXISTS \'confirmed\'');
  } catch (error) {
    console.log('ENUM value might already exist or error adding it:', error.message);
  }
};

export const down = async (queryInterface, Sequelize) => {
  // Removing ENUM values is not directly supported in Postgres
};
