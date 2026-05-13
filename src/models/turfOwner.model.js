import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const TurfOwner = sequelize.define('TurfOwner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  profile_image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  zip_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pan_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pan_image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  aadhar_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadhar_image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  account_holder_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  account_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ifsc_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bank_proof_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('owner', 'super_admin'),
    defaultValue: 'owner',
  },
  kyc_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  mobile_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  onboarding_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'turf_owners',
  underscored: true,
  timestamps: true,
});

export default TurfOwner;
