const Transaction = require('../models/transactionModel');
const Withdrawal = require('../models/withdrawalModel');

// Admin login route
exports.adminLogin = (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true; // Set session flag
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized: Invalid password' });
  }
};

// Admin logout route
exports.adminLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clear cookie
    res.status(200).json({ success: true });
  });
};

// Check if admin is logged in
exports.adminCheck = (req, res) => {
  if (req.session.isAdmin) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
};

// Middleware to protect routes
exports.isAdminAuthenticated = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Fetch filtered transactions (protected)
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
