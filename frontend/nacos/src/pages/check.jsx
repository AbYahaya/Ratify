import React, { useState } from 'react';
import axios from 'axios';

const StatusPage = () => {
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAccountInfo(null);

    try {
      const response = await axios.post('http://localhost:3000/api/account/status', {
        name,
        reference,
      });

      const allTransactions = response.data.transactions;
      const payments = allTransactions.filter(tx => tx.type === 'payment');
      const withdrawals = allTransactions.filter(tx => tx.type === 'withdrawal');

      setAccountInfo({
        balance: response.data.balance,
        payments,
        withdrawals,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 pt-10 pb-20">
      <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Check Account Status</h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-10">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g., John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
            <input
              type="text"
              placeholder="e.g., ABC123XYZ"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        {/* ACCOUNT INFO */}
        {accountInfo && (
          <div className="space-y-8">
            <div className="text-xl font-semibold text-green-700 border-b pb-2">
              💰 Total Balance: ₦{accountInfo.balance.toLocaleString()}
            </div>

            {/* PAYMENTS */}
            <div>
              <h3 className="text-xl font-bold mb-3 text-blue-800">Payments</h3>
              {accountInfo.payments.length > 0 ? (
                <ul className="space-y-3">
                  {accountInfo.payments.map((tx, index) => (
                    <li key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <strong>{tx.name}</strong> paid ₦
                        {tx.amount.toLocaleString()} on{' '}
                        <span className="text-sm text-gray-600">
                          {new Date(tx.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        Purpose: <em>{tx.purpose}</em>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No payments found.</p>
              )}
            </div>

            {/* WITHDRAWALS */}
            <div>
              <h3 className="text-xl font-bold mb-3 text-red-800">Withdrawals</h3>
              {accountInfo.withdrawals.length > 0 ? (
                <ul className="space-y-3">
                  {accountInfo.withdrawals.map((w, index) => (
                    <li key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <strong>₦{w.amount.toLocaleString()}</strong> withdrawn for{' '}
                        <em>{w.purpose}</em> on{' '}
                        <span className="text-sm text-gray-600">
                          {new Date(w.date).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No withdrawals recorded.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPage;
// This code is a React component for checking the status of a NACOS account.
// It allows users to input their name and transaction reference, and upon submission,
// it fetches the account status from a backend API.
// The response includes the account balance, payments, and withdrawals.
// The component uses Axios for making HTTP requests and manages state with React's useState hook.