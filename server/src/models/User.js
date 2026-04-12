const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  whatsapp: { type: String, default: '' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpires: { type: Date },
  totpSecret: { type: String },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// followersCount est injecté dynamiquement dans les controllers via aggregation
// Le virtual sert de fallback pour eviter les undefined
userSchema.virtual('followersCount').get(function () {
  return this._followersCount || 0;
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
