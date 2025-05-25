const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode'); // npm install qrcode

const generateReceipt = (transaction) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (transaction.status !== 'success') {
        return reject(new Error('Cannot generate receipt for unsuccessful transactions'));
      }

      const doc = new PDFDocument({ size: [300, 350], margin: 20 });
      const filePath = `receipts/receipt_${transaction.reference}.pdf`;

      if (!fs.existsSync('receipts')) {
        fs.mkdirSync('receipts');
      }

      // Register the custom font that supports ₦
      const fontPath = path.join(__dirname, '../font/DejaVuSans.ttf');
      doc.registerFont('DejaVuSans', fontPath);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Background watermark image filling entire page with low opacity
      const logoPath = path.join(__dirname, '../public/sgeQj7P_d.jpeg');
      if (fs.existsSync(logoPath)) {
        doc.save();
        doc.opacity(0.12);
        doc.image(logoPath, 0, 0, { width: doc.page.width, height: doc.page.height });
        doc.restore();
      }

      // Generate QR code as PNG buffer encoding a verification URL or transaction reference
      const qrData = `https://yourdomain.com/verify/${transaction.reference}`;
      const qrCodeImageBuffer = await QRCode.toBuffer(qrData, { type: 'png', width: 100 });

      const formatCurrency = (amount) =>
        `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

      // Header
      doc
        .font('DejaVuSans')
        .fillColor('#0056b3')
        .fontSize(16)
        .font('DejaVuSans')
        .text('NACOS - ABU Zaria', { align: 'center' });

      doc
        .moveDown(0.3)
        .fontSize(10)
        .fillColor('#333')
        .font('DejaVuSans')
        .text('Payment Receipt', { align: 'center' });

      doc
        .moveDown(0.5)
        .lineWidth(2)
        .strokeColor('#0056b3')
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();

      doc.moveDown(1);

      // Body content with aligned labels and values
      const labelX = doc.page.margins.left;
      const valueX = 120;
      const lineHeight = 18;

      doc.fontSize(9).fillColor('#222').font('DejaVuSans');

      const drawLine = (label, value, y) => {
        doc.font('DejaVuSans').font('Helvetica-Bold').text(label, labelX, y);
        doc.font('DejaVuSans').font('DejaVuSans').text(value, valueX, y);
      };

      let y = doc.y;
      drawLine('Reference:', transaction.reference, y);
      y += lineHeight;
      drawLine('Name:', transaction.name, y);
      y += lineHeight;
      drawLine('Email:', transaction.email, y);
      y += lineHeight;
      drawLine('Amount:', formatCurrency(transaction.amount), y);
      y += lineHeight;
      drawLine('Purpose:', transaction.purpose || 'NACOS Levy', y);
      y += lineHeight;
      drawLine('Date:', new Date(transaction.createdAt).toLocaleString(), y);

      // Draw a subtle border box around the body content
      const boxTop = doc.page.margins.top + 65;
      const boxHeight = y + 10 - boxTop;
      doc
        .lineWidth(0.5)
        .strokeColor('#ccc')
        .rect(labelX - 5, boxTop, doc.page.width - doc.page.margins.left - doc.page.margins.right + 10, boxHeight)
        .stroke();

      doc.moveDown(2);

      // Add the QR code image centered below the details
      const qrX = (doc.page.width - 100) / 2;
      doc.image(qrCodeImageBuffer, qrX, doc.y, { width: 100 });

      doc.moveDown(10);

      // Footer with properly centered text
      doc.save();

      doc
        .fontSize(9)
        .fillColor('#555')
        .font('DejaVuSans')
        .font('Helvetica-Oblique')
        .text('Thank you for your payment!', 0, doc.y, {
          align: 'center',
          width: doc.page.width,
        });

      doc
        .moveDown(0.3)
        .fontSize(7)
        .fillColor('#999')
        .font('DejaVuSans')
        .text('NACOS ABU Zaria © 2025', 0, doc.y, {
          align: 'center',
          width: doc.page.width,
        });

      doc.restore();

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
