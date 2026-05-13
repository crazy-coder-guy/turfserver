import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  turf_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'turfs',
      key: 'id',
    },
  },
  slot_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('available', 'booked', 'blocked'),
    allowNull: false,
    defaultValue: 'available',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'turf_owners',
      key: 'id',
    },
  }
}, {
  tableName: 'turf_slots',
  underscored: true,
  timestamps: true,
});

export default Slot;
