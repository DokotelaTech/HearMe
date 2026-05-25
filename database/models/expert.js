const mongoose = require('mongoose');

// 1. Define the Schema
const expertSchema = new mongoose.Schema({
  name: String,
  address: String, // You need this field for the migration
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  }
});

// 2. Add the index to the schema
expertSchema.index({ location: "2dsphere" });

// 3. Export the model
module.exports = mongoose.model('Expert', expertSchema);