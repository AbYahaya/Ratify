const axios = require('axios');

const PaystackService = {
    initializePayment: async (email, amount, callbackUrl) => {
        try {
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount: amount * 100, // Convert to kobo
                    callback_url: callbackUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Paystack Response:', response.data); // Add this for debugging
            return response.data;
        } catch (error) {
            console.error('Paystack initialization error:', error.response?.data || error.message);
            if (error.response) {
                console.log('Full error response from Paystack:', error.response.data);
            }
            throw new Error('Error initializing payment with Paystack');
        }
    },

    verifyPayment: async (reference) => {
        try {
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Paystack verification error:', error.response?.data || error.message);
            throw new Error('Error verifying payment with Paystack');
        }
    },
};

module.exports = PaystackService;
