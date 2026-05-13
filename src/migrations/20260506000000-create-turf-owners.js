export const up = async (queryInterface, Sequelize) => {
  console.log('Running migration: create-turf-owners');
  await queryInterface.createTable('turf_owners', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    mobile_number: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    profile_image_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    zip_code: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    pan_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    pan_image_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    aadhar_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aadhar_image_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    account_holder_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    account_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ifsc_code: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    bank_proof_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    role: {
      type: Sequelize.ENUM('owner', 'super_admin'),
      defaultValue: 'owner',
    },
    kyc_status: {
      type: Sequelize.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    email_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    mobile_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    onboarding_completed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    last_login_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    }
  }, { ifNotExists: true });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('turf_owners');
};
