const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

// Dashboard stats
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [totalProperties, verifiedProperties, totalUsers, totalLeads, pendingVerification] = await Promise.all([
      Property.countDocuments({ isActive: true }),
      Property.countDocuments({ isVerified: true, isActive: true }),
      User.countDocuments({ isActive: true }),
      Lead.countDocuments(),
      Property.countDocuments({ isVerified: false, isActive: true }),
    ]);
    res.json({ success: true, data: { totalProperties, verifiedProperties, totalUsers, totalLeads, pendingVerification } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify a property
router.put('/verify/:id', ...adminOnly, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedAt: new Date(), verificationBadges: req.body.badges || ['ID Verified', 'Photos Verified'] },
      { new: true }
    );
    res.json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle featured
router.put('/feature/:id', ...adminOnly, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    property.isFeatured = !property.isFeatured;
    await property.save();
    res.json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// All pending properties
router.get('/pending', ...adminOnly, async (req, res) => {
  try {
    const props = await Property.find({ isVerified: false, isActive: true })
      .populate('owner', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, data: props });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// All users
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;