const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    await Property.findByIdAndUpdate(req.body.property, { $inc: { enquiryCount: 1 } });
    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/my', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const myPropertyIds = req.user.role === 'admin'
      ? null
      : (await Property.find({ owner: req.user.id }).select('_id')).map(p => p._id);

    const query = myPropertyIds ? { property: { $in: myPropertyIds } } : {};
    const leads = await Lead.find(query).populate('property', 'name address').sort('-createdAt');
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/status', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;