import authService from './auth.service.js';
import { sendResponse, sendError } from '../../utils/response.js';

class AuthController {
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      return sendResponse(res, 201, 'Account created successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, rememberMe } = req.body;
      const result = await authService.login(email, password, rememberMe);
      return sendResponse(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      return sendResponse(res, 200, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const owner = await authService.getMe(req.user.id);
      return sendResponse(res, 200, 'User profile retrieved', owner);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      return sendResponse(res, 200, 'Profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, 400, 'No file uploaded');
      }
      
      // The file URL is available in req.file.location thanks to multer-s3
      return sendResponse(res, 200, 'File uploaded successfully', {
        url: req.file.location,
        key: req.file.key
      });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req, res, next) {
    try {
      const { idToken } = req.body;
      const result = await authService.googleLogin(idToken);
      return sendResponse(res, 200, 'Google Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async updateFcmToken(req, res, next) {
    try {
      const { fcm_token } = req.body;
      const updatedUser = await authService.updateProfile(req.user.id, { fcm_token });
      return sendResponse(res, 200, 'FCM Token updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
