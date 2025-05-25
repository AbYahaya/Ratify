const PDFDocument = require('pdfkit');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const Transaction = require('../models/transactionModel');
const Withdrawal = require('../models/withdrawalModel');

exports.exportTransactionsToPDF = async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date('2000-01-01');
    const endDate = to ? new Date(to) : new Date();

    // Calculate opening balance from transactions before the start date
    const paymentsBefore = await Transaction.find({
      status: 'success',
      createdAt: { $lt: startDate },
    });

    const withdrawalsBefore = await Withdrawal.find({
      date: { $lt: startDate },
    });

    const totalPaymentsBefore = paymentsBefore.reduce((sum, tx) => sum + tx.amount, 0);
    const totalWithdrawnBefore = withdrawalsBefore.reduce((sum, wd) => sum + wd.amount, 0);

    const openingBalance = totalPaymentsBefore - totalWithdrawnBefore;
    let currentBalance = openingBalance;

    // Fetch transactions within the date range
    const payments = await Transaction.find({
      status: 'success',
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const withdrawals = await Withdrawal.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const all = [
      ...payments.map(tx => ({
        type: 'Payment',
        amount: tx.amount,
        label: tx.purpose || tx.reference,
        date: tx.createdAt,
      })),
      ...withdrawals.map(wd => ({
        type: 'Withdrawal',
        amount: wd.amount,
        label: wd.purpose,
        date: wd.date,
      }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Register custom font supporting ₦ sign
    const fontPath = path.join(__dirname, '../font/DejaVuSans.ttf'); // Adjust path as needed
    if (!fs.existsSync(fontPath)) {
      throw new Error('Font file not found at ' + fontPath);
    }
    doc.registerFont('DejaVuSans', fontPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=statement.pdf');
    doc.pipe(res);

    // Background watermark image path
    const logoPath = path.join(__dirname, '../public/sgeQj7P_d.jpeg');
    const hasLogo = fs.existsSync(logoPath);

    // Draw background image with opacity (only image, no text) on current page
    const drawBackground = () => {
      if (hasLogo) {
        doc.save();
        doc.opacity(0.12);
        doc.image(logoPath, 0, 0, { width: doc.page.width, height: doc.page.height });
        doc.restore();
      }
    };

    // Draw background on first page
    drawBackground();

    // Table column positions
    const colX = {
      date: 50,
      type: 120,
      amount: 200,
      label: 290,
      balance: 450,
    };
    const rowHeight = 20;
    const pageBottom = 750;

    // Function to draw table header (called on first page and page breaks)
    const drawTableHeader = (doc, columns, y) => {
      doc.font('DejaVuSans').fontSize(10).fillColor('#000');
      doc.text('DATE', columns.date, y);
      doc.text('TYPE', columns.type, y);
      doc.text('AMOUNT (₦)', columns.amount, y);
      doc.text('LABEL', columns.label, y);
      doc.text('BALANCE (₦)', columns.balance, y);
      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
    };

    // Draw background and table header on every new page
    doc.on('pageAdded', () => {
      drawBackground();
      drawTableHeader(doc, colX, 70);
    });

    // Header
    doc
      .font('DejaVuSans')
      .fillColor('#000')
      .fontSize(22)
      .text('NACOS Statement of Account', { align: 'center' });

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`Period: ${moment(startDate).format('LL')} — ${moment(endDate).format('LL')}`, { align: 'center' });

    doc.moveDown(1.5);

    // Summary
    const totalPayments = payments.reduce((sum, tx) => sum + tx.amount, 0);
    const totalWithdrawn = withdrawals.reduce((sum, wd) => sum + wd.amount, 0);
    const closingBalance = totalPayments - totalWithdrawn + openingBalance;

    const formatCurrency = val => `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formatNumber = val => val.toLocaleString(undefined, { minimumFractionDigits: 2 });

    doc.fontSize(11).fillColor('#111').font('DejaVuSans');
    doc.text(`Opening Balance:  ${formatCurrency(openingBalance)}`);
    doc.text(`Total Payments:   ${formatCurrency(totalPayments)}`);
    doc.text(`Total Withdrawals: ${formatCurrency(totalWithdrawn)}`);
    doc.text(`Closing Balance:  ${formatCurrency(closingBalance)}`);
    doc.moveDown(1);

    // Draw initial table header
    let y = doc.y;
    drawTableHeader(doc, colX, y);
    y += 20;

    // Table rows
    doc.font('DejaVuSans').fontSize(9).fillColor('#333');

    for (const tx of all) {
      if (y + rowHeight > pageBottom) {
        doc.addPage();
        y = 90; // leave space after header on new page
      }

      currentBalance += tx.type === 'Payment' ? tx.amount : -tx.amount;

      doc.text(moment(tx.date).format('YYYY-MM-DD'), colX.date, y);
      doc.text(tx.type, colX.type, y);
      doc.text(formatNumber(tx.amount), colX.amount, y);
      doc.text(tx.label, colX.label, y, { width: 150 });
      doc.text(formatNumber(currentBalance), colX.balance, y);

      y += rowHeight;
    }

    // Add page numbers after finishing document
    doc.end();

    doc.on('end', () => {
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        const bottom = doc.page.height - 40;
        doc.font('DejaVuSans').fontSize(9).fillColor('#666');
        doc.text(`Page ${i + 1}`, 0, bottom, {
          align: 'center',
          width: doc.page.width,
        });
      }
    });

  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
};
