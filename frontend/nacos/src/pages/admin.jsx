import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', purpose: '', madeBy: '' });
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/admin/login', { password });
      if (res.data.success) {
        setLoggedIn(true);
        fetchData();
      } else {
        setMessage('Invalid password');
      }
    } catch (err) {
      setMessage('Login failed');
    }
  };

  const fetchData = async () => {
    try {
      const txRes = await axios.get('http://localhost:3000/api/admin/transactions');
      const wdRes = await axios.get('http://localhost:3000/api/withdrawals');
      setTransactions(txRes.data);
      setWithdrawals(wdRes.data);
    } catch (err) {
      setMessage('Failed to load data');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/withdrawals/create', withdrawForm);
      setMessage('✅ Withdrawal added');
      setWithdrawForm({ amount: '', purpose: '', madeBy: '' });
      fetchData();
    } catch (err) {
      setMessage('❌ Error adding withdrawal');
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
          {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-blue-800">Admin Dashboard</h2>

        <section className="mb-10 bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold mb-4 text-green-700">➕ Add Withdrawal</h3>
          <form onSubmit={handleWithdraw} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Amount (₦)"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="text"
              placeholder="Purpose"
              value={withdrawForm.purpose}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, purpose: e.target.value })}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="text"
              placeholder="Made By"
              value={withdrawForm.madeBy}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, madeBy: e.target.value })}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="submit"
              className="md:col-span-3 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Add Withdrawal
            </button>
          </form>
        </section>

        <section className="mb-10 bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">💳 Transactions</h3>
          {transactions.length > 0 ? (
            <ul className="space-y-3">
              {transactions.map((tx) => (
                <li
                  key={tx._id}
                  className="p-4 border border-blue-200 bg-blue-50 rounded-md"
                >
                  <strong>{tx.name}</strong> paid ₦{tx.amount.toLocaleString()} on{' '}
                  <span className="text-sm text-gray-600">
                    {new Date(tx.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No transactions available.</p>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold mb-4 text-red-700">📤 Withdrawals</h3>
          {withdrawals.length > 0 ? (
            <ul className="space-y-3">
              {withdrawals.map((wd) => (
                <li
                  key={wd._id}
                  className="p-4 border border-red-200 bg-red-50 rounded-md"
                >
                  ₦{wd.amount.toLocaleString()} withdrawn by <strong>{wd.madeBy}</strong> for{' '}
                  <em>"{wd.purpose}"</em>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No withdrawals recorded.</p>
          )}
        </section>

        {message && (
          <p className="mt-6 text-green-600 font-semibold text-center">{message}</p>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
// Compare this snippet from frontend/nacos/src/App.jsx:
// import React from 'react';