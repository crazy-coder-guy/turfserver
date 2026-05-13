import admin from 'firebase-admin';
import Notification from '../../models/notification.model.js';
import User from '../../models/user.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NotificationService {
  constructor() {
    // Note: In a real app, you'd provide the service account JSON
    // For this environment, we assume the environment is set up or use a mock approach
    this.isInitialized = false;
    try {
      if (!admin.apps.length) {
        const serviceAccountPath = path.join(__dirname, '../../../projectturf-firebase-adminsdk-fbsvc-cf120ffdcb.json');
        
        if (fs.existsSync(serviceAccountPath)) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
          });
          this.isInitialized = true;
          console.log('Firebase Admin initialized with service account ✅');
        } else {
          // Fallback to environment or empty init (will fail on send but we'll catch it)
          console.warn('Firebase service account NOT found at:', serviceAccountPath);
          console.warn('Push notifications will be simulated until the service account is added.');
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'projectturf' // Hardcoded fallback for dev
          });
        }
      } else {
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('Firebase Admin Init Warning:', e.message);
      this.isInitialized = false;
    }
  }

  async sendToUser(userId, { title, message, type = 'general', data = {} }) {
    try {
      // 1. Create In-App Notification (Always works as long as DB is up)
      const inAppNotification = await Notification.create({
        user_id: userId,
        title,
        message,
        type,
        data
      });

      // 2. Get User FCM Token
      const user = await User.findByPk(userId);
      if (user && user.fcm_token) {
        const payload = {
          notification: {
            title,
            body: message,
          },
          android: {
            priority: 'high',
            notification: {
              channel_id: 'booking_notifications',
              priority: 'high',
              sound: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                contentAvailable: true,
                sound: 'default',
              },
            },
          },
          data: {
            ...data,
            notification_id: inAppNotification.id,
            type
          },
          token: user.fcm_token
        };

        // 3. Send Push Notification
        if (this.isInitialized) {
          try {
            const response = await admin.messaging().send(payload);
            console.log(`Push notification sent to user ${userId} ✅ | Response: ${response}`);
          } catch (sendError) {
            console.error('Failed to send FCM message for user:', userId);
            console.error('Error Details:', sendError.message);
            if (sendError.code === 'messaging/registration-token-not-registered') {
              console.warn('Token is no longer valid. Clearing token for user:', userId);
              user.fcm_token = null;
              await user.save();
            }
          }
        } else {
          console.log('--- SIMULATED PUSH NOTIFICATION ---');
          console.log(`To: User ${userId} (${user.name})`);
          console.log(`Token: ${user.fcm_token.substring(0, 10)}...`);
          console.log(`Title: ${title}`);
          console.log(`Body: ${message}`);
          console.log('-----------------------------------');
        }
      } else {
        console.warn(`User ${userId} has no FCM token. Skipping push notification.`);
      }

      return inAppNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      // We don't throw here to avoid breaking the booking flow if notification fails
    }
  }

  async sendBookingConfirmation(userId, booking) {
    const title = 'Booking Confirmed! ⚽';
    const message = `Your booking for ${booking.booking_date} at ${booking.start_time} is confirmed. Get ready to play!`;
    
    return this.sendToUser(userId, {
      title,
      message,
      type: 'booking_confirmed',
      data: {
        booking_id: booking.id,
        turf_id: booking.turf_id
      }
    });
  }

  async sendTeamInvitation(userId, { captainName, turfName, shareAmount, bookingId }) {
    const title = 'New Match Invitation! ⚽';
    const message = `${captainName} invited you to a game at ${turfName}. Your share is ₹${shareAmount}.`;
    
    return this.sendToUser(userId, {
      title,
      message,
      type: 'team_invitation',
      data: {
        booking_id: bookingId,
        amount: shareAmount.toString(),
        turf_name: turfName
      }
    });
  }
}

export default new NotificationService();
