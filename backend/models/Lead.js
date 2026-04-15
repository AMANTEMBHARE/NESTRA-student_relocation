const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    message: { type: String, trim: true },
    moveInDate: { type: Date },
    budget: { type: String },
    source: { type: String, enum: ['whatsapp', 'call', 'form', 'email'], default: 'form' },
    status: { type: String, enum: ['new', 'contacted', 'converted', 'rejected'], default: 'new' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

//module.exports = mongoose.model('Lead', leadSchema);
module.exports = mongoose.models.lead || mongoose.model('lead', leadSchema);