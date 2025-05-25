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

exports.getAllWithdrawals = async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    const withdrawals = await Withdrawal.find(query).sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
};

exports.getSummaryStats = async (req, res) => {
  try {
    const payments = await Transaction.find({ status: 'success' });

    const withdrawals = await Withdrawal.find();

    const totalPayments = payments.reduce((sum, tx) => sum + tx.amount, 0);
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const balance = totalPayments - totalWithdrawn;

    res.status(200).json({
      totalPayments,
      totalWithdrawn,
      balance,
    });
  } catch (err) {
    console.error('Error calculating summary stats:', err);
    res.status(500).json({ error: 'Failed to compute summary statistics' });
  }
};
