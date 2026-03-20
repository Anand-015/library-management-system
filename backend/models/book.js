const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  ISBN: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 1 },
  available: { type: Number, required: true, default: 1 },
  borrowCount: { type: Number, default: 0 },
  reservedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);