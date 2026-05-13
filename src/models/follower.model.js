import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

class Follower extends Model {}

Follower.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  follower_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    }
  },
  following_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    }
  }
}, {
  sequelize,
  modelName: 'Follower',
  tableName: 'Followers',
  underscored: true,
});

export default Follower;
