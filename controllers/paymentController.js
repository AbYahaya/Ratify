// paymentController.js
const PaystackService = require('../utils/PaystackService');
const Transaction = require('../models/transactionModel');
const generateReceipt = require('../utils/pdfGenerator');
const crypto = require('crypto');

// Verifies the webhook signature
const verifyWebhookSignature = (req) => {
    const paystackSignature = req.headers['x-paystack-signature'];
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    return hash === paystackSignature;
};

// Initiates a payment
exports.initiatePayment = async (req, res) => {
    try {
        const { name, email, amount } = req.body;

        if (!name || !email || !amount) {
            return res.status(400).json({ error: 'Name, email, and amount are required' });
        }

        const paystackResponse = await PaystackService.initializePayment(email, amount, `${process.env.PAYSTACK_CALLBACK_URL}/api/payments/callback`);
        console.log('Full Paystack response:', paystackResponse); // Log entire response for debugging

        if (!paystackResponse || !paystackResponse.data || !paystackResponse.data.authorization_url || !paystackResponse.data.reference) {
            throw new Error('Invalid Paystack response');
        }

        const { authorization_url, reference } = paystackResponse.data;

        const transaction = new Transaction({ reference, name, email, amount, status: 'pending' });
        await transaction.save();

        res.status(200).json({ authorization_url, reference });
    } catch (error) {
        console.error('Error initiating payment:', error.message || error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};

// Handles payment callback
exports.handleCallback = async (req, res) => {
    if (req.method === 'GET') {
        console.log('Received a GET request to the callback URL');
        const { reference } = req.query; // Extract reference from query params

        if (!reference) {
            return res.status(400).json({ error: 'Payment reference is missing' });
        }

        try {
            const paystackResponse = await PaystackService.verifyPayment(reference);
            console.log('Paystack Verification Response:', paystackResponse);

            const validStatuses = ['success', 'failed', 'pending'];
            const status = paystackResponse.data.status;

            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid payment status received' });
            }

            const transaction = await Transaction.findOneAndUpdate(
                { reference },
                { status },
                { new: true }
            );

            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            if (status === 'success') {
                const receiptPath = await generateReceipt(transaction);

                return res.status(200).json({
                    message: 'Payment successful',
                    receipt_url: `${req.protocol}://${req.get('host')}/${receiptPath}`,
                    transaction,
                });
            } else {
                return res.status(400).json({ message: 'Payment failed', transaction });
            }
        } catch (error) {
            console.error('Error handling GET callback:', error.message || error);
            return res.status(500).json({ error: 'Failed to process payment callback' });
        }
    }

    return res.status(405).send('Method Not Allowed'); // For non-GET methods
};

