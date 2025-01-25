const puppeteer = require('puppeteer');
const axios = require('axios');

jest.setTimeout(30000); // Increase timeout for long-running tests

describe('Payment Flow E2E Test', () => {
    let browser;
    let page;
    let testReference;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false }); // Use `true` in CI/CD
        page = await browser.newPage();
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    it('should complete the payment flow and generate a receipt', async () => {
        try {
            // Step 1: Initiate Payment
            const initiateResponse = await axios.post('http://localhost:3000/api/payments/initiate', {
                name: 'John Doe',
                email: 'john@example.com',
                amount: 1000,
            });
            expect(initiateResponse.status).toBe(200);
            expect(initiateResponse.data.authorization_url).toBeDefined();
            testReference = initiateResponse.data.reference;

            // Step 2: Simulate Paystack Callback
            const callbackResponse = await axios.post('http://localhost:3000/api/payments/callback', {
                reference: testReference,
            });
            expect(callbackResponse.status).toBe(200);
            expect(callbackResponse.data.transaction.status).toBe('success');

            // Step 3: Open Receipt URL in Puppeteer
            const receiptUrl = callbackResponse.data.receipt_url;
            expect(receiptUrl).toBeDefined();
            await page.goto(receiptUrl, { waitUntil: 'networkidle2' });

            const receiptText = await page.evaluate(() => document.body.textContent);
            expect(receiptText).toContain('Payment successful');
            console.log('Receipt validated:', receiptText);
        } catch (err) {
            console.error('Error in test:', err);
            throw err; // Ensure Jest reports the error
        }
    });
});
