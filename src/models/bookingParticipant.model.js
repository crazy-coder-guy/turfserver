import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const BookingParticipant = sequelize.define('BookingParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'user_bookings',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  share_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'confirmed'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'booking_participants',
  underscored: true,
  timestamps: true,
});

export default BookingParticipant;
