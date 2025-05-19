const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Route to get full account status (balance + history)
router.post('/status', accountController.getAccountStatus);

module.exports = router;
