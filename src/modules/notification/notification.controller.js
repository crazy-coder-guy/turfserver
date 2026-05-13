
import Notification from '../../models/notification.model.js';
import { sendResponse } from '../../utils/response.js';

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const notifications = await Notification.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        limit: 50
      });
      return sendResponse(res, 200, 'Notifications retrieved', notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findOne({
        where: { id, user_id: req.user.id }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.update({ is_read: true });
      return sendResponse(res, 200, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { user_id: req.user.id, is_read: false } }
      );
      return sendResponse(res, 200, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
