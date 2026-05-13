import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import TurfOwner from '../../models/turfOwner.model.js';
import User from '../../models/user.model.js';

const googleClient = new OAuth2Client(env.GOOGLE.CLIENT_ID);

class AuthService {
  async signup(userData) {
    const { name, email, password, role = 'user' } = userData;

    // Check if email already exists in either table
    const existingOwner = await TurfOwner.findOne({ where: { email } });
    const existingUser = await User.findOne({ where: { email } });

    if (existingOwner || existingUser) {
      throw new Error('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    let createdUser;
    if (role === 'owner') {
      createdUser = await TurfOwner.create({
        name,
        email,
        password_hash,
        role: 'owner',
        is_active: true,
      });
    } else {
      createdUser = await User.create({
        name,
        email,
        password: password_hash, // User model uses 'password' instead of 'password_hash'
        is_active: true,
      });
    }

    const tokens = this.generateTokens(createdUser);

    return {
      ...tokens,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role || 'user',
        kyc_status: createdUser.kyc_status || 'none',
        onboarding_completed: createdUser.onboarding_completed || false,
      },
    };
  }

  async login(email, password, rememberMe = false) {
    // Try finding in both tables
    let userRecord = await TurfOwner.findOne({ where: { email } });
    let isOwner = true;

    if (!userRecord) {
      userRecord = await User.findOne({ where: { email } });
      isOwner = false;
    }

    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    // Handle different password field names in models
    const storedHash = isOwner ? userRecord.password_hash : userRecord.password;
    
    if (!storedHash) {
      throw new Error('Please login using Google');
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (!userRecord.is_active && userRecord.role !== 'super_admin') {
      throw new Error('Your account is not active. Please contact admin.');
    }

    const tokens = this.generateTokens(userRecord);

    userRecord.last_login_at = new Date();
    await userRecord.save();

    return {
      ...tokens,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        role: userRecord.role || 'user',
        kyc_status: userRecord.kyc_status || 'none',
        onboarding_completed: userRecord.onboarding_completed || false,
      },
    };
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, role: user.role || 'user' },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT.REFRESH_SECRET,
      { expiresIn: env.JWT.REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT.REFRESH_SECRET);
      
      let user = await TurfOwner.findByPk(decoded.id);
      if (!user) user = await User.findByPk(decoded.id);

      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      const accessToken = jwt.sign(
        { id: user.id, role: user.role || 'user' },
        env.JWT.SECRET,
        { expiresIn: env.JWT.EXPIRES_IN }
      );

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async getMe(id) {
    let user = await TurfOwner.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    if (!user) user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    return user;
  }

  async googleLogin(idToken) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE.CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, name, sub: google_id, picture } = payload;

      let user = await User.findOne({ where: { email } });

      if (!user) {
        user = await User.create({
          name,
          email,
          google_id,
          profile_image_url: picture,
          is_active: true,
        });
      } else {
        if (!user.google_id) {
          user.google_id = google_id;
          if (picture && !user.profile_image_url) {
            user.profile_image_url = picture;
          }
          await user.save();
        }
      }

      const tokens = this.generateTokens(user);
      
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile_image_url: user.profile_image_url,
          is_active: user.is_active,
          role: 'user'
        },
      };
    } catch (error) {
      console.error('Google Login Error:', error);
      throw new Error('Invalid Google Token');
    }
  }

  async updateProfile(id, updateData) {
    let user = await User.findByPk(id);
    if (!user) {
      user = await TurfOwner.findByPk(id);
    }

    if (!user) {
      throw new Error('User not found');
    }

    const allowedFields = ['name', 'mobile_number', 'gender', 'profile_image_url', 'fcm_token'];
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = updateData[key];
      }
    });

    await user.save();
    return user;
  }
}

export default new AuthService();
