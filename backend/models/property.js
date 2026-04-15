const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  type: { type: String, enum: ['single', 'double', 'triple', 'dormitory'], required: true },
  price: { type: Number, required: true },
  availability: { type: Number, default: 0 },
  totalRooms: { type: Number, default: 0 },
  features: [String],
});

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Property name is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['pg', 'hostel', 'flat', 'mess'], default: 'pg' },
    gender: { type: String, enum: ['boys', 'girls', 'co-ed'], required: true },

    // Location
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    // Pricing
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    roomTypes: [roomTypeSchema],
    depositMonths: { type: Number, default: 2 },

    // Details
    description: { type: String, required: true },
    images: [{ type: String }],
    thumbnail: { type: String, default: '' },

    // Amenities
    amenities: [{ type: String }],
    nearbyServices: {
      college: [{ name: String, distance: String }],
      transport: [{ name: String, distance: String }],
      medical: [{ name: String, distance: String }],
      food: [{ name: String, distance: String }],
      atm: [{ name: String, distance: String }],
      other: [{ name: String, distance: String }],
    },

    // Rules
    rules: [String],
    foodType: { type: String, enum: ['veg', 'non-veg', 'both', 'none'], default: 'none' },
    messIncluded: { type: Boolean, default: false },

    // Ratings
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Verification
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verificationBadges: [String],

    // Status
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    enquiryCount: { type: Number, default: 0 },

    // Contact
    contactPhone: { type: String },
    contactWhatsapp: { type: String },
  },
  { timestamps: true }
);

// Auto-generate slug
propertySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
  }
  next();
});

// Text search index
propertySchema.index({ name: 'text', 'address.area': 'text', 'address.city': 'text', description: 'text' });
propertySchema.index({ 'address.city': 1, 'priceRange.min': 1 });
propertySchema.index({ isVerified: 1, isActive: 1 });

module.exports = mongoose.model('Property', propertySchema);