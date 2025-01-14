const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route for viewing all transactions (protected by password)
router.post('/login', transactionController.adminLogin);
router.get('/transactions', transactionController.getAllTransactions);

module.exports = router;
