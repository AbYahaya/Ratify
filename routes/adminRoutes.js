const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const adminController = require('../controllers/adminController');

// Route for viewing all transactions (protected by password)
router.post('/login', transactionController.adminLogin);
router.get('/transactions', transactionController.getAllTransactions);
router.get('/export-pdf', adminController.exportTransactionsToPDF);


module.exports = router;
