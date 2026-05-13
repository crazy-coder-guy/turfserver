import Slot from '../models/slot.model.js';
import Turf from '../models/turf.model.js';
import sequelize from '../config/db.js';

async function seedSlots() {
  try {
    console.log('--- Starting Slot Seeding ---');
    await sequelize.sync();

    const turf = await Turf.findOne();
    if (!turf) {
      console.log('❌ No turf found. Please seed turfs first.');
      process.exit(1);
    }

    const today = new Date().toISOString().split('T')[0];
    const slots = [];

    // Create 10 slots for today
    for (let i = 6; i < 16; i++) {
      slots.push({
        turf_id: turf.id,
        slot_date: today,
        start_time: `${i.toString().padStart(2, '0')}:00:00`,
        end_time: `${(i + 1).toString().padStart(2, '0')}:00:00`,
        type: 'available',
        price: turf.price
      });
    }

    await Slot.bulkCreate(slots);
    console.log(`✅ Successfully seeded ${slots.length} slots for turf: ${turf.name}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Slot seeding failed:', error);
    process.exit(1);
  }
}

seedSlots();
