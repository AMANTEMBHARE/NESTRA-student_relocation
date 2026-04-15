const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['student', 'owner', 'admin'], default: 'student' },
    avatar: { type: String, default: '' },
    college: { type: String, default: '' },
    city: { type: String, default: '' },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//module.exports = mongoose.model('User', userSchema);
module.exports = mongoose.models.user || mongoose.model('user', userSchema);