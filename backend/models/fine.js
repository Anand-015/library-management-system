const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrow: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrow', required: true },
  amount: { type: Number, required: true },
  perDayCharge: { type: Number, default: 5 },
  daysOverdue: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'waived'], default: 'pending' },
  waivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  waiverReason: { type: String },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);