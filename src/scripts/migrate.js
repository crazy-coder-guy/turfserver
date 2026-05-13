import { Umzug, JSONStorage } from 'umzug';
import { Sequelize } from 'sequelize';
import sequelize from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import fs from 'fs';

const migrationsPath = path.join(__dirname, '../../migrations.json');

const umzug = new Umzug({
  migrations: { 
    glob: ['../migrations/*.js', { cwd: __dirname }],
    resolve: ({ name, path, context }) => {
      return {
        name,
        up: async () => {
          const migration = await import(`file://${path}`);
          return migration.up(context, Sequelize);
        },
        down: async () => {
          const migration = await import(`file://${path}`);
          return migration.down(context, Sequelize);
        },
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new JSONStorage({ path: migrationsPath }),
  logger: console,
});

export const runMigrations = async () => {
  try {
    // Self-healing: Check if critical tables exist
    const [ownersCheck] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'turf_owners')");
    const [turfsCheck] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'turfs')");
    
    const ownersExists = ownersCheck[0].exists;
    const turfsExists = turfsCheck[0].exists;

    console.log(`Table 'turf_owners' exists: ${ownersExists ? 'TRUE ✅' : 'FALSE ❌'}`);
    console.log(`Table 'turfs' exists: ${turfsExists ? 'TRUE ✅' : 'FALSE ❌'}`);

    if ((!ownersExists || !turfsExists) && fs.existsSync(migrationsPath)) {
      console.log('One or more critical tables missing but migration history exists. Clearing history to re-run...');
      fs.unlinkSync(migrationsPath);
    }

    console.log('Checking for pending migrations...');
    const all = await umzug.migrations();
    console.log(`Discovered ${all.length} total migrations.`);
    
    const pending = await umzug.pending();
    if (pending.length === 0) {
      console.log('No pending migrations.');
      return;
    }
    console.log(`Executing ${pending.length} migrations: ${pending.map(m => m.name).join(', ')}`);
    await umzug.up();
    console.log('Migrations executed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations();
}
