const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  madeBy: {
    type: String, // Optional: who initiated the withdrawal
    default: 'Admin',
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
