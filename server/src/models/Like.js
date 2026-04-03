const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user can only like a product once
likeSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
