const Transaction = require('../models/transactionModel');

// Admin login route
exports.adminLogin = (req, res) => {
    const { password } = req.body;
  
    if (password === process.env.ADMIN_PASSWORD) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Unauthorized: Invalid password' });
    }
  };

// Fetch filtered transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { name, reference, from, to } = req.query;

    const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (reference) query.reference = { $regex: reference, $options: 'i' };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching filtered transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

