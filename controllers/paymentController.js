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
        const { reference } = req.query;

        if (!reference) {
            return res.status(400).send('Payment reference is missing');
        }

        try {
            const paystackResponse = await PaystackService.verifyPayment(reference);
            const status = paystackResponse.data.status;

            if (!['success', 'failed', 'pending'].includes(status)) {
                return res.status(400).send('Invalid payment status received');
            }

            const transaction = await Transaction.findOneAndUpdate(
                { reference },
                { status },
                { new: true }
            );

            if (!transaction) {
                return res.status(404).send('Transaction not found');
            }

            if (status === 'success') {
                const receiptPath = await generateReceipt(transaction);
                const frontendRedirectUrl = `${process.env.FRONTEND_URL}/payment-success?receipt_url=${encodeURIComponent(`${req.protocol}://${req.get('host')}/${receiptPath}`)}&reference=${reference}`;

                return res.redirect(frontendRedirectUrl);
            } else {
                return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reference=${reference}`);
            }
        } catch (error) {
            console.error('Error handling callback:', error.message || error);
            return res.status(500).send('Internal server error during callback');
        }
    }

    return res.status(405).send('Method Not Allowed');
};


