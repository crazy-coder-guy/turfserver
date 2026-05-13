import Turf from '../../models/turf.model.js';
import { Op } from 'sequelize';
import sequelize from '../../config/db.js';
import Slot from '../../models/slot.model.js';

class TurfService {
  async createTurf(ownerId, turfData) {
    return await Turf.create({
      ...turfData,
      owner_id: ownerId,
    });
  }

  async getAllTurfs(query, user) {
    const { page = 1, limit = 10, search = '', status, city, sport_type } = query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Authorization logic for management (Owner/Admin)
    if (user && user.role !== 'super_admin') {
      where.owner_id = user.id;
    }

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    if (status) {
      where.status = status;
    }

    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    if (sport_type) {
      where.sport_type = sport_type;
    }

    const { count, rows } = await Turf.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      turfs: rows,
    };
  }

  async getPublicTurfs(query) {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      city, 
      sport_type,
      min_price,
      max_price,
      min_rating,
      amenities,
      sort_by
    } = query;
    const offset = (page - 1) * limit;

    const where = { status: 'active' };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    if (sport_type && sport_type !== 'All') {
      where.sport_type = sport_type;
    }

    // Price Filter
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    // Rating Filter
    if (min_rating) {
      where.rating = { [Op.gte]: parseFloat(min_rating) };
    }

    // Amenities Filter (JSONB array contains)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      where.amenities = { [Op.contains]: amenitiesList };
    }

    // Sorting
    let order = [['created_at', 'DESC']];
    if (sort_by === 'price_asc') order = [['price', 'ASC']];
    else if (sort_by === 'price_desc') order = [['price', 'DESC']];
    else if (sort_by === 'rating_desc') order = [['rating', 'DESC']];
    else if (sort_by === 'popular') order = [['total_reviews', 'DESC']];

    const { count, rows } = await Turf.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
    });

    return {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      turfs: rows,
    };
  }

  async searchTurfs(query) {
    const { q = '', page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where = {
      status: 'active',
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { city: { [Op.iLike]: `%${q}%` } },
        { address: { [Op.iLike]: `%${q}%` } },
        { sport_type: { [Op.iLike]: `%${q}%` } },
      ],
    };

    const { count, rows } = await Turf.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      turfs: rows,
    };
  }

  async getNearbyTurfs(query) {
    const { latitude, longitude, radius = 10, limit = 8 } = query;
    
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Distance calculation in km using spherical law of cosines
    const distanceSql = sequelize.literal(
      `6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))`
    );

    const turfs = await Turf.findAll({
      attributes: {
        include: [[distanceSql, 'distance']]
      },
      where: {
        status: 'active',
        [Op.and]: [
          sequelize.where(distanceSql, { [Op.lte]: rad })
        ]
      },
      order: distanceSql,
      limit: parseInt(limit),
    });

    return turfs;
  }

  async getPublicTurfById(id) {
    const turf = await Turf.findOne({
      where: { id, status: 'active' }
    });
    
    if (!turf) {
      throw new Error('Turf not found or inactive');
    }

    return turf;
  }

  async getTurfById(id, user) {
    const turf = await Turf.findByPk(id);
    
    if (!turf) {
      throw new Error('Turf not found');
    }

    // Authorization logic
    if (user.role !== 'super_admin' && turf.owner_id !== user.id) {
      throw new Error('Not authorized to access this turf');
    }

    return turf;
  }

  async updateTurf(id, ownerId, updateData) {
    const turf = await Turf.findByPk(id);

    if (!turf) {
      throw new Error('Turf not found');
    }

    if (turf.owner_id !== ownerId) {
      throw new Error('Not authorized to update this turf');
    }

    // Filter out restricted fields for owners
    const allowedUpdates = { ...updateData };
    delete allowedUpdates.owner_id;
    delete allowedUpdates.status; // Only admin can change status according to requirements (or we can handle it separately)

    return await turf.update(allowedUpdates);
  }

  async updateTurfStatus(id, status) {
    const turf = await Turf.findByPk(id);
    if (!turf) throw new Error('Turf not found');
    return await turf.update({ status });
  }

  async getTurfSlots(turfId, date) {
    const where = { turf_id: turfId };
    if (date) {
      where.slot_date = date;
    }

    let slots = await Slot.findAll({
      where,
      order: [['start_time', 'ASC']],
    });

    // Check if we have 1-hour slots that need splitting (Development/Migration helper)
    const hasLegacySlots = slots.length > 0 && slots.some(s => {
      const timeToMins = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      return (timeToMins(s.end_time) - timeToMins(s.start_time)) > 30;
    });

    // Auto-generate or migrate slots for the date
    if ((slots.length === 0 || hasLegacySlots) && date) {
      const turf = await Turf.findByPk(turfId);
      if (turf) {
        // If migrating, delete only the 'available' slots (keep booked ones)
        if (hasLegacySlots) {
          await Slot.destroy({
            where: {
              turf_id: turfId,
              slot_date: date,
              type: 'available'
            }
          });
        }

        const newSlots = [];
        // Generate slots from 6 AM to 11:30 PM (48 slots total for 24 hours, but we do 6am-11pm)
        for (let i = 6; i < 23; i++) {
          const hour = i.toString().padStart(2, '0');
          const nextHour = (i + 1).toString().padStart(2, '0');

          // Check if :00 slot already exists (might be booked)
          const exists00 = slots.find(s => s.start_time === `${hour}:00:00`);
          if (!exists00) {
            newSlots.push({
              turf_id: turfId,
              slot_date: date,
              start_time: `${hour}:00:00`,
              end_time: `${hour}:30:00`,
              type: 'available',
              price: turf.price ? (parseFloat(turf.price.toString().replace(/[^0-9.]/g, '')) / 2) : 400
            });
          }

          // Check if :30 slot already exists
          const exists30 = slots.find(s => s.start_time === `${hour}:30:00`);
          if (!exists30) {
            newSlots.push({
              turf_id: turfId,
              slot_date: date,
              start_time: `${hour}:30:00`,
              end_time: `${nextHour}:00:00`,
              type: 'available',
              price: turf.price ? (parseFloat(turf.price.toString().replace(/[^0-9.]/g, '')) / 2) : 400
            });
          }
        }
        
        if (newSlots.length > 0) {
          await Slot.bulkCreate(newSlots);
        }

        slots = await Slot.findAll({
          where,
          order: [['start_time', 'ASC']],
        });
      }
    }

    return slots;
  }
  
  async getTurfReviews(turfId) {
    const { Review, User } = await import('../../models/associations.js');
    
    return await Review.findAll({
      where: { turf_id: turfId },
      include: [
        {
          model: User,
          attributes: ['name'],
        }
      ],
      order: [['created_at', 'DESC']],
    });
  }
}

export default new TurfService();
