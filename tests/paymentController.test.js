const request = require('supertest');
const app = require('../app'); // Your Express app
const mockingoose = require('mockingoose');
const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const axios = require('axios');
const nock = require('nock'); // Import nock

jest.mock('axios');

describe('Payment Controller - initiatePayment', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
        nock.cleanAll(); // Clear all nock interceptors before each test
    });

    it('should initiate payment successfully', async () => {
        // Mock Paystack API response using nock
        nock('https://api.paystack.co')
            .post('/transaction/initialize')
            .reply(200, {
                data: {
                    authorization_url: 'http://test-authorization-url.com',
                    reference: 'test_reference',
                },
            });

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
        // Mock Paystack API error using nock
        nock('https://api.paystack.co')
            .post('/transaction/initialize')
            .reply(500, {
                status: false,
                message: 'Paystack error',
            });

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

afterAll(async () => {
    await mongoose.connection.close();
});