import User from './user.model.js';
import Turf from './turf.model.js';
import Slot from './slot.model.js';
import TurfOwner from './turfOwner.model.js';
import UserBooking from './userBooking.model.js';
import Review from './review.model.js';
import BookingParticipant from './bookingParticipant.model.js';
import Follower from './follower.model.js';

// Turf - TurfOwner
TurfOwner.hasMany(Turf, { foreignKey: 'owner_id' });
Turf.belongsTo(TurfOwner, { foreignKey: 'owner_id' });

// Slot - Turf
Turf.hasMany(Slot, { foreignKey: 'turf_id' });
Slot.belongsTo(Turf, { foreignKey: 'turf_id' });

// Slot - TurfOwner (created_by)
TurfOwner.hasMany(Slot, { foreignKey: 'created_by' });
Slot.belongsTo(TurfOwner, { foreignKey: 'created_by' });

// UserBooking - User
User.hasMany(UserBooking, { foreignKey: 'user_id' });
UserBooking.belongsTo(User, { foreignKey: 'user_id' });

// UserBooking - Turf
Turf.hasMany(UserBooking, { foreignKey: 'turf_id' });
UserBooking.belongsTo(Turf, { foreignKey: 'turf_id' });

// UserBooking - Slot
Slot.hasOne(UserBooking, { foreignKey: 'slot_id' });
UserBooking.belongsTo(Slot, { foreignKey: 'slot_id' });

// Review - User
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Review - Turf
Turf.hasMany(Review, { foreignKey: 'turf_id' });
Review.belongsTo(Turf, { foreignKey: 'turf_id' });

// Review - UserBooking
UserBooking.hasOne(Review, { foreignKey: 'booking_id' });
Review.belongsTo(UserBooking, { foreignKey: 'booking_id' });

// BookingParticipant - UserBooking
UserBooking.hasMany(BookingParticipant, { foreignKey: 'booking_id' });
BookingParticipant.belongsTo(UserBooking, { foreignKey: 'booking_id' });

// BookingParticipant - User
User.hasMany(BookingParticipant, { foreignKey: 'user_id' });
BookingParticipant.belongsTo(User, { foreignKey: 'user_id' });

// Follower associations
User.hasMany(Follower, { as: 'Followers', foreignKey: 'following_id' });
User.hasMany(Follower, { as: 'Following', foreignKey: 'follower_id' });
Follower.belongsTo(User, { as: 'follower', foreignKey: 'follower_id' });
Follower.belongsTo(User, { as: 'following', foreignKey: 'following_id' });

export {
  User,
  Turf,
  Slot,
  TurfOwner,
  UserBooking,
  Review,
  BookingParticipant,
  Follower
};
