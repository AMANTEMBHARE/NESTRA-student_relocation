const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

router.get('/property/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId, isApproved: true })
      .populate('user', 'name avatar college')
      .sort('-createdAt');
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const existing = await Review.findOne({ property: req.body.property, user: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this property' });
    const review = await Review.create({ ...req.body, user: req.user.id });
    const populated = await review.populate('user', 'name avatar college');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;