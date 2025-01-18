const request = require('supertest');
const app = require('../app'); // Your Express app
const mockingoose = require('mockingoose');
const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const axios = require('axios');
const generateReceipt = require('../utils/pdfGenerator');

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error logs
});

afterEach(() => {
    jest.restoreAllMocks(); // Restore original console behavior
});

jest.mock('axios');
jest.mock('../utils/pdfGenerator'); // Mock PDF generator

describe('Payment Controller', () => {
    describe('initiatePayment', () => {
        beforeEach(() => {
            jest.clearAllMocks(); // Clear mocks before each test
        });

        it('should initiate payment successfully', async () => {
            axios.post.mockResolvedValue({
                data: {
                    data: {
                        authorization_url: 'http://test-authorization-url.com',
                        reference: 'test_reference',
                    },
                },
            });

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

    describe('handleCallback', () => {
        beforeEach(() => {
            jest.clearAllMocks(); // Clear mocks before each test
        });

        it('should handle a successful payment callback and generate a receipt', async () => {
            axios.get.mockResolvedValue({
                data: { data: { status: 'success' } },
            });

            mockingoose(Transaction).toReturn(
                {
                    reference: 'test_reference',
                    name: 'John Doe',
                    email: 'john@example.com',
                    amount: 1000,
                    status: 'success',
                },
                'findOneAndUpdate'
            );

            generateReceipt.mockResolvedValue('receipts/test_receipt.pdf');

            const res = await request(app)
                .post('/api/payments/callback')
                .send({ reference: 'test_reference' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Payment successful');
            expect(res.body.receipt_url).toContain('http://');
            expect(res.body.transaction.status).toBe('success');
        });

        it('should return 400 if reference is missing', async () => {
            const res = await request(app)
                .post('/api/payments/callback')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Payment reference is required');
        });

        it('should return 404 if transaction is not found', async () => {
            axios.get.mockResolvedValue({
                data: { data: { status: 'success' } },
            });

            mockingoose(Transaction).toReturn(null, 'findOneAndUpdate');

            const res = await request(app)
                .post('/api/payments/callback')
                .send({ reference: 'test_reference' });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Transaction not found');
        });

        it('should return 400 if payment failed', async () => {
            axios.get.mockResolvedValue({
                data: { data: { status: 'failed' } },
            });

            mockingoose(Transaction).toReturn(
                {
                    reference: 'test_reference',
                    name: 'John Doe',
                    email: 'john@example.com',
                    amount: 1000,
                    status: 'failed',
                },
                'findOneAndUpdate'
            );

            const res = await request(app)
                .post('/api/payments/callback')
                .send({ reference: 'test_reference' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Payment failed');
            expect(res.body.transaction.status).toBe('failed');
        });

        it('should return 500 if an error occurs', async () => {
            axios.get.mockRejectedValue(new Error('Paystack error'));

            const res = await request(app)
                .post('/api/payments/callback')
                .send({ reference: 'test_reference' });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Failed to process payment callback');
        });
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});