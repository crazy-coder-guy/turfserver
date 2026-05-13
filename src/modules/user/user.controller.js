import authService from '../auth/auth.service.js';
import userService from './user.service.js';
import { sendResponse } from '../../utils/response.js';

class UserController {
  async discoverUsers(req, res, next) {
    try {
      const { query, limit, page } = req.query;
      const data = await userService.discoverUsers(req.user.id, query, limit, page);
      return sendResponse(res, 200, 'Users discovered', data);
    } catch (error) {
      next(error);
    }
  }

  async getMyFriends(req, res, next) {
    try {
      const { query, limit, page } = req.query;
      const data = await userService.getMyFriends(req.user.id, query, limit, page);
      return sendResponse(res, 200, 'Friends retrieved', data);
    } catch (error) {
      next(error);
    }
  }

  async followUser(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await userService.followUser(req.user.id, userId);
      return sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return sendResponse(res, 200, 'User profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      return sendResponse(res, 200, 'Profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
