export const up = async (queryInterface, Sequelize) => {
  const tableInfo = await queryInterface.describeTable('turf_owners');
  if (!tableInfo.google_id) {
    await queryInterface.addColumn('turf_owners', 'google_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  }
};

export const down = async (queryInterface, Sequelize) => {
  try { await queryInterface.removeColumn('turf_owners', 'google_id'); } catch (e) {}
};
