// seed-availability.js — run ONCE: node seed-availability.js
require('dotenv').config();
const mongoose = require('mongoose');
const Availability = require('./database/models/Availability');

const defaultAvailability = [
    { day_of_week: 'Monday',    start_time: '09:00 AM', end_time: '05:00 PM', is_active: true },
    { day_of_week: 'Tuesday',   start_time: '09:00 AM', end_time: '05:00 PM', is_active: true },
    { day_of_week: 'Wednesday', start_time: '09:00 AM', end_time: '05:00 PM', is_active: true },
    { day_of_week: 'Thursday',  start_time: '09:00 AM', end_time: '05:00 PM', is_active: true },
    { day_of_week: 'Friday',    start_time: '09:00 AM', end_time: '05:00 PM', is_active: true },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        await Availability.deleteMany({});
        console.log('🗑️  Cleared old records');
        await Availability.insertMany(defaultAvailability);
        console.log('✅ Seeded Monday–Friday (is_active: true)');
        const saved = await Availability.find();
        saved.forEach(d => console.log(`   ${d.day_of_week} | active: ${d.is_active}`));
        await mongoose.disconnect();
        console.log('✅ Done! Run: node server.js');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}
seed();