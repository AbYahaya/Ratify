const request = require('supertest');
const app = require('../app'); // Your Express app
const mockingoose = require('mockingoose');
const Transaction = require('../models/transactionModel');
const axios = require('axios');

jest.mock('axios');

describe('Payment Controller - initiatePayment', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should initiate payment successfully', async () => {
        // Mock Paystack API response
        const mockResponse = {
            data: {
                data: {
                    authorization_url: 'http://test-authorization-url.com',
                    reference: 'test_reference',
                },
            },
        };
        axios.post.mockResolvedValue(mockResponse);

        // Mock Mongoose Transaction save
        mockingoose(Transaction).toReturn(
            {
                name: 'John Doe',
                email: 'john@example.com',
                amount: 1000,
                reference: 'test_reference',
                status: 'pending',
            },
            'save'
        );

        const paymentData = {
            name: 'John Doe',
            email: 'john@example.com',
            amount: 1000,
        };

        const res = await request(app)
            .post('/api/payments/initiate') // Adjust this endpoint if necessary
            .send(paymentData);

        expect(res.statusCode).toBe(200);
        expect(res.body.authorization_url).toBe('http://test-authorization-url.com');
        expect(res.body.reference).toBe('test_reference');
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/api/payments/initiate')
            .send({ email: 'john@example.com' }); // Missing name and amount

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Name, email, and amount are required');
    });

    it('should return 500 if Paystack API call fails', async () => {
        axios.post.mockRejectedValue(new Error('Paystack error'));

        const paymentData = {
            name: 'John Doe',
            email: 'john@example.com',
            amount: 1000,
        };

        const res = await request(app)
            .post('/api/payments/initiate')
            .send(paymentData);

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Failed to initiate payment');
    });
});
