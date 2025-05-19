const Withdrawal = require('../models/withdrawalModel');
const Transaction = require('../models/transactionModel');

// Create a new withdrawal
exports.createWithdrawal = async (req, res) => {
  try {
    const { amount, purpose, madeBy } = req.body;

    if (!amount || !purpose) {
      return res.status(400).json({ error: 'Amount and purpose are required' });
    }

    // Calculate current account balance
    const successfulPayments = await Transaction.find({ status: 'success' });
    const totalPaid = successfulPayments.reduce((sum, tx) => sum + tx.amount, 0);

    const allWithdrawals = await Withdrawal.find();
    const totalWithdrawn = allWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const currentBalance = totalPaid - totalWithdrawn;

    if (amount > currentBalance) {
      return res.status(400).json({ error: 'Insufficient account balance for this withdrawal' });
    }

    // Save withdrawal
    const withdrawal = new Withdrawal({
      amount,
      purpose,
      madeBy: madeBy || 'Admin',
    });

    await withdrawal.save();
    res.status(201).json({ message: 'Withdrawal recorded successfully', withdrawal });

  } catch (error) {
    console.error('Error creating withdrawal:', error);
    res.status(500).json({ error: 'Failed to create withdrawal' });
  }
};

// Get all withdrawals
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ date: -1 });
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
};
