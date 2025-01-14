const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateReceipt = (transaction) => {
    return new Promise((resolve, reject) => {
        try {
            // Ensure the transaction status is successful
            if (transaction.status !== 'success') {
                return reject(new Error('Cannot generate receipt for unsuccessful transactions'));
            }

            const doc = new PDFDocument();
            const filePath = `receipts/receipt_${transaction.reference}.pdf`;

            // Create receipts folder if it doesn't exist
            if (!fs.existsSync('receipts')) {
                fs.mkdirSync('receipts');
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Add content to the PDF
            doc.fontSize(20).text('Payment Receipt', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).text(`Reference: ${transaction.reference}`);
            doc.text(`Name: ${transaction.name}`);
            doc.text(`Email: ${transaction.email}`);
            doc.text(`Amount: ₦${(transaction.amount / 100).toFixed(2)}`);
            doc.text(`Status: ${transaction.status}`);
            doc.text(`Date: ${new Date(transaction.createdAt).toLocaleString()}`);

            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (error) => {
                reject(new Error('Error writing to file: ' + error.message));
            });
        } catch (error) {
            reject(new Error('Error generating receipt: ' + error.message));
        }
    });
};

module.exports = generateReceipt;
