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

            // Add styles to the PDF
            // Header with association name
            doc
                .font('Times-Italic')
                .fontSize(24)
                .fillColor('#007BFF') // Set color to a blue shade
                .text('Nigeria Association of Computing Students, ABU', { align: 'center' });

            doc.moveDown();

            // Subtitle
            doc
                .fontSize(16)
                .fillColor('black') // Reset color to black
                .text('Payment Receipt', { align: 'center' });

            doc.moveDown(2);

            // Transaction details
            doc
                .font('Helvetica')
                .fontSize(14)
                .fillColor('#333333'); // Dark gray text color

            doc.text(`Reference: ${transaction.reference}`);
            doc.text(`Name: ${transaction.name}`);
            doc.text(`Email: ${transaction.email}`);
            doc.text(`Amount: ₦${(transaction.amount / 100).toFixed(2)}`);
            doc.text(`Status: ${transaction.status}`);
            doc.text(`Date: ${new Date(transaction.createdAt).toLocaleString()}`);

            // Footer
            doc.moveDown(2);
            doc
                .fontSize(10)
                .fillColor('#555555') // Lighter gray for the footer
                .text('Thank you for your payment!', { align: 'center' });

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
