import sequelize from '../config/db.js';

async function check() {
  try {
    const results = await sequelize.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')", { type: sequelize.QueryTypes.SELECT });
    console.log('All Tables found:', results);
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    process.exit();
  }
}

check();
