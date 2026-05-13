export const up = async (queryInterface, Sequelize) => {
  const tableInfo = await queryInterface.describeTable('turfs');
  
  if (!tableInfo.price) {
    await queryInterface.addColumn('turfs', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
  }
  
  if (!tableInfo.rating) {
    await queryInterface.addColumn('turfs', 'rating', {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0,
    });
  }
  
  if (!tableInfo.total_reviews) {
    await queryInterface.addColumn('turfs', 'total_reviews', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  }
};

export const down = async (queryInterface, Sequelize) => {
  try { await queryInterface.removeColumn('turfs', 'price'); } catch (e) {}
  try { await queryInterface.removeColumn('turfs', 'rating'); } catch (e) {}
  try { await queryInterface.removeColumn('turfs', 'total_reviews'); } catch (e) {}
};
