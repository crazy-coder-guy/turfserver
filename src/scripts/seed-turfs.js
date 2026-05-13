import Turf from '../models/turf.model.js';
import sequelize from '../config/db.js';

const ownerId = '48fd7387-60f6-4d22-bf8f-69cd6ececd55';

const sampleTurfs = [
  {
    owner_id: ownerId,
    name: 'The Apex Arena',
    description: 'A premier multi-sport destination engineered for those who demand excellence in every play. Spanning over 15,000 square feet of meticulously maintained grounds.',
    sport_type: 'Multi-sport',
    address: '85/242, South, Sandaipet, Kondalampatti',
    city: 'Salem',
    state: 'Tamil Nadu',
    pincode: '636010',
    price: 1500.00,
    rating: 4.8,
    total_reviews: 156,
    images: [
      'https://turfadmin-datastore.s3.us-east-1.amazonaws.com/misc/1778089513676-football.jpg',
      'https://turfadmin-datastore.s3.us-east-1.amazonaws.com/misc/1778089520764-cricket.png'
    ],
    amenities: ['parking', 'canteen', 'floodlights', 'wifi', 'washroom'],
    start_time: '06:00:00',
    end_time: '23:00:00',
    latitude: 11.62808903,
    longitude: 78.11878441,
    status: 'active'
  },
  {
    owner_id: ownerId,
    name: 'Velocity Field',
    description: 'High-octane football turf with international grade 5G grass. Perfect for competitive leagues and training.',
    sport_type: 'Football',
    address: '42, North Main Road, Fairlands',
    city: 'Salem',
    state: 'Tamil Nadu',
    pincode: '636016',
    price: 1200.00,
    rating: 4.5,
    total_reviews: 89,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['parking', 'drinking_water', 'washroom'],
    start_time: '05:00:00',
    end_time: '00:00:00',
    latitude: 11.6643,
    longitude: 78.1460,
    status: 'active'
  },
  {
    owner_id: ownerId,
    name: 'Grand Slam Pavilion',
    description: 'Elite cricket turf with professional lighting and practice nets. Experience the game like never before.',
    sport_type: 'Cricket',
    address: '12/A, Bypass Road, Seelanaickenpatti',
    city: 'Salem',
    state: 'Tamil Nadu',
    pincode: '636201',
    price: 1800.00,
    rating: 4.9,
    total_reviews: 210,
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['canteen', 'parking', 'floodlights', 'drinking_water'],
    start_time: '06:00:00',
    end_time: '23:00:00',
    latitude: 11.6212,
    longitude: 78.1523,
    status: 'active'
  },
  {
    owner_id: ownerId,
    name: 'Blue Court Elite',
    description: 'Premium indoor multisport court. Ideal for Badminton, Futsal, and Basketball.',
    sport_type: 'Multi-sport',
    address: 'Plot 5, Industrial Estate, Steel Plant Road',
    city: 'Salem',
    state: 'Tamil Nadu',
    pincode: '636013',
    price: 1000.00,
    rating: 4.7,
    total_reviews: 124,
    images: [
      'https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['wifi', 'washroom', 'shower', 'parking'],
    start_time: '07:00:00',
    end_time: '22:00:00',
    latitude: 11.6500,
    longitude: 78.0800,
    status: 'active'
  }
];

async function seed() {
  try {
    console.log('--- Starting Turf Seeding ---');
    
    // Sync models with database (adds new columns if missing)
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized.');

    // Check if turfs already exist to avoid duplicates
    const count = await Turf.count();
    if (count > 1) {
      console.log(`⚠️ Database already has ${count} turfs. Skipping seeding to prevent duplicates.`);
      process.exit(0);
    }

    await Turf.bulkCreate(sampleTurfs);
    console.log('✅ Successfully seeded 4 premium turfs.');
    
    console.log('--- Seeding Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
