import { Sequelize } from 'sequelize';
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// 1. Initialize Supabase SDK Client (for Storage, Auth, etc.)
export const supabase = createClient(
  env.SUPABASE.URL, 
  env.SUPABASE.SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 2. Initialize Sequelize (for Database Models)
// Using the connection string is the "proper" way to connect to Supabase/Postgres
console.log('Connecting to DB with URL:', env.SUPABASE_DATABASE_URL ? env.SUPABASE_DATABASE_URL.split('@')[1] : 'UNDEFINED');
const sequelize = new Sequelize(env.SUPABASE_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: env.NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export default sequelize;
