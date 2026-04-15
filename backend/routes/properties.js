const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/properties - Search & filter properties
router.get('/', async (req, res) => {
  try {
    const {
      city, area, type, gender, minPrice, maxPrice,
      amenities, verified, featured, search,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };

    if (city) query['address.city'] = new RegExp(city, 'i');
    if (area) query['address.area'] = new RegExp(area, 'i');
    if (type) query.type = type;
    if (gender) query.gender = gender;
    if (verified === 'true') query.isVerified = true;
    if (featured === 'true') query.isFeatured = true;

    if (minPrice || maxPrice) {
      query['priceRange.min'] = {};
      if (minPrice) query['priceRange.min'].$gte = Number(minPrice);
      if (maxPrice) query['priceRange.min'].$lte = Number(maxPrice);
    }

    if (amenities) {
      const arr = amenities.split(',');
      query.amenities = { $all: arr };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('owner', 'name phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-nearbyServices -rules -roomTypes');

    res.json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: properties,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/properties/featured
router.get('/featured', async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, isActive: true, isVerified: true })
      .populate('owner', 'name')
      .limit(8)
      .sort('-rating');
    res.json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name phone email avatar');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    // Increment enquiry count
    await Property.findByIdAndUpdate(req.params.id, { $inc: { enquiryCount: 1 } });
    res.json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/properties - Create listing (owner/admin)
router.post('/', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const property = await Property.create({ ...req.body, owner: req.user.id });
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @PUT /api/properties/:id
router.put('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @DELETE /api/properties/:id
router.delete('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;