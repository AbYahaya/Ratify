const Transaction = require('../models/transactionModel');
const Withdrawal = require('../models/withdrawalModel'); // assuming step 2 added this

exports.getAccountStatus = async (req, res) => {
    try {
        const { name, reference } = req.body;

        if (!name || !reference) {
            return res.status(400).json({ error: 'Name and reference are required' });
        }

        // Verify user exists via a valid payment transaction
        const validTransaction = await Transaction.findOne({ name, reference, status: 'success' });

        if (!validTransaction) {
            return res.status(404).json({ error: 'No matching successful transaction found' });
        }

        // Fetch all transactions
        const payments = await Transaction.find({ status: 'success' });
        const withdrawals = await Withdrawal.find();

        // Calculate total balance
        const totalPayments = payments.reduce((sum, tx) => sum + tx.amount, 0);
        const totalWithdrawals = withdrawals.reduce((sum, wd) => sum + wd.amount, 0);
        const balance = totalPayments - totalWithdrawals;

        // Format combined history
        const transactionHistory = [
            ...payments.map(tx => ({
                type: 'payment',
                name: tx.name,
                amount: tx.amount,
                reference: tx.reference,
                date: tx.createdAt
            })),
            ...withdrawals.map(wd => ({
                type: 'withdrawal',
                purpose: wd.purpose,
                amount: wd.amount,
                date: wd.date
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

        return res.status(200).json({
            balance,
            transactions: transactionHistory
        });

    } catch (error) {
        console.error('Error fetching account status:', error);
        return res.status(500).json({ error: 'Server error fetching account status' });
    }
};
