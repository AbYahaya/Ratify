const puppeteer = require('puppeteer');

async function generatePDFWithPuppeteer() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = `
    <html>
        <head>
            <title>Transaction Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                p { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>Transaction Receipt</h1>
            <p>Transaction ID: TX12345</p>
            <p>User Name: John Doe</p>
            <p>Amount Paid: $100</p>
            <p>Date: 2025-01-03</p>
        </body>
    </html>
    `;

    await page.setContent(htmlContent);

    const filePath = 'receipt-puppeteer.pdf';
    await page.pdf({ path: filePath, format: 'A4' });

    await browser.close();
    console.log(`PDF generated using Puppeteer: ${filePath}`);
}

generatePDFWithPuppeteer();
