import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  profile_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  total_bookings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  followers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  following: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fcm_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (!user.username) {
        // Generate initial username from name or email
        let baseUsername = user.name 
          ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '') 
          : user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (!baseUsername) baseUsername = 'player';
        
        let username = baseUsername;
        let counter = 1;
        let exists = true;
        
        // Loop until a unique username is found
        while (exists) {
          const existingUser = await User.findOne({ 
            where: { username },
            attributes: ['id']
          });
          
          if (!existingUser) {
            exists = false;
          } else {
            username = `${baseUsername}${counter}`;
            counter++;
          }
        }
        
        user.username = username;
      }
    }
  }
});

export default User;
