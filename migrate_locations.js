require('dotenv').config();
const mongoose = require('mongoose');
const NodeGeocoder = require('node-geocoder');
const Expert = require('./models/Expert'); // Your Expert model

const dbUri = process.env.MONGODB_URI || 'mongodb+srv://dokotela:UzyqqkxSYm13FG7P@hearme.j75fkq2.mongodb.net/hearme_db?retryWrites=true&w=majority';

const options = {
  provider: 'openstreetmap' // Free, no API key needed
};

const geocoder = NodeGeocoder(options);

async function migrate() {
  await mongoose.connect(dbUri);
  
  // Find experts who don't have a 'location' yet
  const experts = await Expert.find({ location: { $exists: false } });
  console.log(`Found ${experts.length} experts to update.`);

  for (const expert of experts) {
    try {
      // Assuming your address field is called 'address'
      const res = await geocoder.geocode(expert.address);
      
      if (res.length > 0) {
        const { longitude, latitude } = res[0];
        
        // Update the document with the required GeoJSON structure
        expert.location = {
          type: 'Point',
          coordinates: [longitude, latitude] // [lng, lat]
        };
        
        await expert.save();
        console.log(`Updated: ${expert.name}`);
      }
    } catch (err) {
      console.error(`Failed to geocode ${expert.name}:`, err);
    }
  }
  
  console.log('Migration complete!');
  process.exit();
}

migrate();