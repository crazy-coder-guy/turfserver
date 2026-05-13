
import sequelize from './src/config/db.js';
import User from './src/models/user.model.js';

async function listUsers() {
  const users = await User.findAll();
  users.forEach(u => {
    console.log(`ID: ${u.id}, Name: ${u.name}, Token: ${u.fcm_token ? 'YES' : 'MISSING'}`);
  });
  process.exit();
}

listUsers();
