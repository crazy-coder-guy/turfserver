import app from './app.js';
import sequelize from './config/db.js';
import { env } from './config/env.js';
import { runMigrations } from './scripts/migrate.js';
import './models/associations.js';
import BookingReminderService from './modules/booking/bookingReminders.js';

const startServer = async () => {
  try {
    // 1. Connect to PostgreSQL
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // 2. Check and run pending migrations
    await runMigrations();

    // Explicit check for turf_owners table in the public schema
    const [tableCheck] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'turf_owners')");
    const tableExists = tableCheck[0].exists;
    console.log(`Table 'turf_owners' exists in DB: ${tableExists ? 'TRUE ✅' : 'FALSE ❌'}`);

    // 3. Initialize Background Services
    BookingReminderService.init();

    // 4. Start Express server
    const PORT = env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or run migrations:', error);
    process.exit(1);
  }
};

startServer();
