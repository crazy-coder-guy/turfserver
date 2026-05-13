export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('turfs', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'turf_owners',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    sport_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    state: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pincode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    whatsapp_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    contact_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    amenities: {
      type: Sequelize.JSONB,
      defaultValue: '[]',
    },
    images: {
      type: Sequelize.JSONB,
      defaultValue: '[]',
    },
    start_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    end_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'active',
    },
    latitude: {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('turfs');
};
