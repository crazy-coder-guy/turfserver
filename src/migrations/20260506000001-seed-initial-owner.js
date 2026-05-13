import bcrypt from 'bcryptjs';

export const up = async (queryInterface, Sequelize) => {
  const [existing] = await queryInterface.sequelize.query(
    `SELECT id FROM turf_owners WHERE email = 'ragulvishnukumar@gmail.com' LIMIT 1`
  );

  if (existing.length > 0) {
    console.log('Seed user already exists, skipping insert.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  await queryInterface.bulkInsert('turf_owners', [
    {
      id: Sequelize.literal('gen_random_uuid()'),
      email: 'ragulvishnukumar@gmail.com',
      password_hash: hashedPassword,
      role: 'owner',
      is_active: true,
      onboarding_completed: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete('turf_owners', {
    email: 'ragulvishnukumar@gmail.com',
  });
};
