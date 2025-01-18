const axios = require('axios');

const PaystackService = {
    initializePayment: async (email, amount, callbackUrl) => {
        try {
            const data = {
                email,
                amount: amount * 100, // Convert to kobo (smallest unit)
                callback_url: callbackUrl,
            };

            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                data,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    },
                }
            );
            console.log('Paystack Response:', response.data);

            return response.data;
        } catch (error) {
            console.error('Error initializing payment:', error.message || error);
            if (error.response) {
                console.error('Paystack API error:', error.response.data      
                )}
                throw new Error('Failed to initialize payment');}
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
            console.error('Error verifying payment:', error);
            throw new Error('Failed to verify payment');
        }
    },
};

module.exports = PaystackService;
