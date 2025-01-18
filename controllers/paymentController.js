const PaystackService = require('../utils/PaystackService');
const Transaction = require('../models/transactionModel');
const generateReceipt = require('../utils/pdfGenerator');

//const PaystackService = require('../utils/PaystackService');
//const Transaction = require('../models/transactionModel');
//const generateReceipt = require('../utils/pdfGenerator');

// Initiates a payment
exports.initiatePayment = async (req, res) => {
    try {
        const { name, email, amount } = req.body;

        // Validate required fields
        if (!name || !email || !amount) {
            return res.status(400).json({ error: 'Name, email, and amount are required' });
        }

        // Initialize payment via Paystack
        const paystackResponse = await PaystackService.initializePayment(name, email, amount);

        // Ensure Paystack response contains necessary fields
        if (!paystackResponse || !paystackResponse.data || !paystackResponse.data.authorization_url || !paystackResponse.data.reference) {
            throw new Error('Invalid Paystack response');
        }

        const { authorization_url, reference } = paystackResponse.data;

        // Save transaction details in database
        const transaction = new Transaction({
            reference,
            name,
            email,
            amount,
            status: 'pending',
        });
        await transaction.save();

        res.status(200).json({ authorization_url, reference });
    } catch (error) {
        console.error('Error initiating payment:', error.message || error);
        res.status(500).json({ error: 'Failed to initiate payment' });
        console.error('Paystack API error:', error.response ? error.response.data : error.message);
    }
};

// Handles payment callback
exports.handleCallback = async (req, res) => {
    try {
        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({ error: 'Payment reference is required' });
        }

        // Verify payment with Paystack
        const paystackResponse = await PaystackService.verifyPayment(reference);
        const status = paystackResponse.data.status;

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
            const receiptPath = await generateReceipt(transaction);

            res.status(200).json({
                message: 'Payment successful',
                receipt_url: `${req.protocol}://${req.get('host')}/${receiptPath}`,
                transaction,
            });
        } else {
            res.status(400).json({ message: 'Payment failed', transaction });
        }
    } catch (error) {
        console.error('Error handling payment callback:', error.message || error);
        res.status(500).json({ error: 'Failed to process payment callback' });
    }
};
