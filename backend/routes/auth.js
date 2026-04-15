const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, college, city } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role, college, city });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, college: user.college, city: user.city, savedProperties: user.savedProperties },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account is deactivated' });

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, college: user.college, city: user.city, savedProperties: user.savedProperties },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @POST /api/auth/save-property/:id
router.post('/save-property/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.id;
    const idx = user.savedProperties.indexOf(propertyId);
    let saved;
    if (idx === -1) {
      user.savedProperties.push(propertyId);
      saved = true;
    } else {
      user.savedProperties.splice(idx, 1);
      saved = false;
    }
    await user.save();
    res.json({ success: true, saved, savedProperties: user.savedProperties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
