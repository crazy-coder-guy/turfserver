import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import TurfOwner from '../../models/turfOwner.model.js';
import User from '../../models/user.model.js';

const googleClient = new OAuth2Client(env.GOOGLE.CLIENT_ID);

class AuthService {
  async signup(userData) {
    const { name, email, password } = userData;

    const existingOwner = await TurfOwner.findOne({ where: { email } });
    if (existingOwner) {
      throw new Error('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const owner = await TurfOwner.create({
      name,
      email,
      password_hash,
      role: 'owner',
      is_active: true,
    });

    const tokens = this.generateTokens(owner);

    return {
      ...tokens,
      user: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        role: owner.role,
        kyc_status: owner.kyc_status,
        onboarding_completed: owner.onboarding_completed,
      },
    };
  }

  async login(email, password, rememberMe = false) {
    const owner = await TurfOwner.findOne({ where: { email } });
    if (!owner) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, owner.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (!owner.is_active && owner.role !== 'super_admin') {
      throw new Error('Your account is not active. Please contact admin.');
    }

    const tokens = this.generateTokens(owner);

    owner.last_login_at = new Date();
    await owner.save();

    return {
      ...tokens,
      user: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        role: owner.role,
        kyc_status: owner.kyc_status,
        onboarding_completed: owner.onboarding_completed,
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
      // Try finding in both tables or define which one based on payload if needed
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
    // Try finding in both tables
    let user = await TurfOwner.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    if (!user) user = await User.findByPk(id);
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
        },
      };
    } catch (error) {
      console.error('Google Login Error:', error);
      throw new Error('Invalid Google Token');
    }
  }

  async updateProfile(id, updateData) {
    // Try finding in both tables
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
