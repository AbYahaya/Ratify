const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePDFWithPDFKit() {
    const doc = new PDFDocument();
    const filePath = 'receipt-pdfkit.pdf';

    doc.pipe(fs.createWriteStream(filePath));

    // Add content to the PDF
    doc.fontSize(20).text('Transaction Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Transaction ID: TX12345');
    doc.text('User Name: John Doe');
    doc.text('Amount Paid: $100');
    doc.text('Date: 2025-01-03');

    doc.end();
    console.log(`PDF generated using PDFKit: ${filePath}`);
}

generatePDFWithPDFKit();