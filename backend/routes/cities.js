const express = require('express');
const router = express.Router();
const City = require('../models/city');
const Property = require('../models/property');

router.get('/', async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort('-propertyCount');
    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const city = await City.findOne({ slug: req.params.slug });
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });
    const propertyCount = await Property.countDocuments({ 'address.city': new RegExp(city.name, 'i'), isActive: true });
    res.json({ success: true, data: { ...city.toObject(), propertyCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;