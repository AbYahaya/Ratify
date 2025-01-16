const axios = require('axios');
const Transaction = require('../models/Transaction');
const generate = require('../utils/pdfGenerator');

// Controller for initiating payment
exports.initiatePayment = async (req, res) => {
    try {
        const { name, email, amount } = req.body;

        if (!name || !email || !amount) {
            return res.status(400).json({ error: 'Name, email, and amount are required' });
        }

        // Prepare data for Paystack payment initialization
        const paystackData = {
            email,
            amount: amount * 100, // Convert amount to kobo
            callback_url: process.env.PAYSTACK_CALLBACK_URL,
        };

        // Send request to Paystack API
        const response = await axios.post('https://api.paystack.co/transaction/initialize', paystackData, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        // Save transaction to database
        const transaction = new Transaction({
            name,
            email,
            amount,
            reference: response.data.data.reference,
            status: 'pending',
        });
        await transaction.save();

        res.status(200).json({
            message: 'Payment initiated successfully',
            authorization_url: response.data.data.authorization_url,
        });
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};

// Controller for handling payment callback
exports.handleCallback = async (req, res) => {
    try {
        const { reference } = req.body;

        // Verify payment with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        const status = response.data.data.status;

        // Update transaction status in database
        const transaction = await Transaction.findOneAndUpdate(
            { reference },
            { status },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (status === 'success') {
            // Generate PDF receipt
            const receiptPath = await generate(transaction);

            res.status(200).json({
                message: 'Payment successful',
                receipt_url: `${req.protocol}://${req.get('host')}/${receiptPath}`,
                transaction,
            });
        } else {
            res.status(400).json({ message: 'Payment failed', transaction });
        }
    } catch (error) {
        console.error('Error handling payment callback:', error);
        res.status(500).json({ error: 'Failed to process payment callback' });
    }
};