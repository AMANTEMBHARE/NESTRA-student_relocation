const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    state: { type: String, required: true },
    image: { type: String, default: '' },
    description: { type: String },
    propertyCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    coordinates: { lat: Number, lng: Number },
    popularAreas: [{ name: String, propertyCount: Number }],
    colleges: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('City', citySchema);