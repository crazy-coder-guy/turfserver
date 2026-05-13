import User from '../models/user.model.js';
import sequelize from '../config/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('--- Starting User Seeding (500+ users) ---');
    
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized.');

    // Check if users already exist to avoid duplicates (excluding admins if any)
    const count = await User.count();
    if (count > 10) {
      console.log(`⚠️ Database already has ${count} users. Skipping seeding to prevent mass duplicates.`);
      process.exit(0);
    }

    console.log('⏳ Generating 500 users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [];

    for (let i = 1; i <= 510; i++) {
      const name = i % 3 === 0 ? `Alex ${i}` : i % 3 === 1 ? `John ${i}` : `Sarah ${i}`;
      const username = `${name.toLowerCase().replace(' ', '')}_${i}`;
      
      users.push({
        name: name,
        username: username,
        email: `user${i}@matchoo.com`,
        mobile_number: (9000000000 + i).toString(),
        password: hashedPassword,
        profile_image_url: `https://i.pravatar.cc/150?u=${i}`,
        total_bookings: Math.floor(Math.random() * 20),
        followers: Math.floor(Math.random() * 500),
        following: Math.floor(Math.random() * 300),
        is_active: true,
        gender: i % 2 === 0 ? 'male' : 'female'
      });

      // Bulk create in chunks of 100 to be safe
      if (users.length === 100) {
        await User.bulkCreate(users);
        console.log(`✅ Seeded ${i} users...`);
        users.length = 0;
      }
    }

    if (users.length > 0) {
      await User.bulkCreate(users);
    }

    console.log('✅ Successfully seeded 510 users.');
    console.log('--- Seeding Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
