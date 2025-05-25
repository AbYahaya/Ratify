const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    madeBy: {
      type: String,
      default: 'Admin',
    },
  },
  { timestamps: true } // ✅ This adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
