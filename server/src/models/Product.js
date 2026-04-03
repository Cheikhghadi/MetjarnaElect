const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  delivery: { type: Number, default: 0 },
  image: { type: String }, // maintained for backward compatibility
  images: [{ type: String }],
  category: { type: String, required: true, default: 'Autres', index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  avgRating: { type: Number, default: 0 },
  status: { type: String, default: 'active', enum: ['active', 'sold'] },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Product', productSchema);
