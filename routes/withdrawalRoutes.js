const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');

// Route to create a withdrawal
router.post('/create', withdrawalController.createWithdrawal);

// Route to get all withdrawals
router.get('/', withdrawalController.getAllWithdrawals);

module.exports = router;
