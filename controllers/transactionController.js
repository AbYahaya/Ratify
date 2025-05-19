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

// Fetch all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};
