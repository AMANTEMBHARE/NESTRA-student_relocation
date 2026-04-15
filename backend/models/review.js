const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      safety: { type: Number, min: 1, max: 5 },
      amenities: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
    },
    isVerifiedStay: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per user per property
reviewSchema.index({ property: 1, user: 1 }, { unique: true });

// Update property rating after save
reviewSchema.post('save', async function () {
  const Property = mongoose.model('Property');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { property: this.property } },
    { $group: { _id: '$property', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Property.findByIdAndUpdate(this.property, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

//module.exports = mongoose.model('Review', reviewSchema);
module.exports = mongoose.models.review || mongoose.model('review', reviewSchema);