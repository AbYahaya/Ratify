const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route for initiating a payment
router.post('/initiate', paymentController.initiatePayment);

// Route for handling payment callbacks (webhook)
router.all('/callback', paymentController.handleCallback);

module.exports = router;
