const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');

// Route to create a withdrawal
router.post('/create', withdrawalController.createWithdrawal);

// Route to get all withdrawals
router.get('/', withdrawalController.getAllWithdrawals);

router.get('/summary', withdrawalController.getSummaryStats);


module.exports = router;
