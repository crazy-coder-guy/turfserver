import User from '../../models/user.model.js';
import Follower from '../../models/follower.model.js';
import { Op } from 'sequelize';

class UserService {
  async discoverUsers(currentUserId, query = '', limit = 20, page = 1) {
    const offset = (page - 1) * limit;
    
    // Get IDs of users already being followed
    const followedUsers = await Follower.findAll({
      where: { follower_id: currentUserId },
      attributes: ['following_id']
    });
    const followedIds = followedUsers.map(f => f.following_id);

    const where = {
      id: { [Op.and]: [{ [Op.ne]: currentUserId }, { [Op.notIn]: followedIds }] },
      is_active: true
    };

    if (query) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { username: { [Op.iLike]: `%${query}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'username', 'profile_image_url', 'total_bookings', 'followers', 'following'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['followers', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  async getMyFriends(currentUserId, query = '', limit = 20, page = 1) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Follower.findAndCountAll({
      where: { follower_id: currentUserId },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'name', 'username', 'profile_image_url', 'total_bookings', 'followers', 'following'],
        where: query ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { username: { [Op.iLike]: `%${query}%` } }
          ]
        } : {}
      }],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      users: rows.map(r => r.following),
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  async followUser(followerId, followingId) {
    if (followerId === followingId) throw new Error('You cannot follow yourself');
    
    const existing = await Follower.findOne({
      where: { follower_id: followerId, following_id: followingId }
    });

    if (existing) return { message: 'Already following' };

    await Follower.create({
      follower_id: followerId,
      following_id: followingId
    });

    const userToFollow = await User.findByPk(followingId);
    const currentUser = await User.findByPk(followerId);

    if (!userToFollow) throw new Error('User not found');

    userToFollow.followers += 1;
    currentUser.following += 1;

    await userToFollow.save();
    await currentUser.save();

    return { message: 'Followed successfully' };
  }
}

export default new UserService();
