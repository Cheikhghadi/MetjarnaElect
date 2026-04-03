const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }, // Encrypted at rest
  thread: { type: String, required: true, index: true }, // Sorted IDs of sender & receiver
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Message', messageSchema);
