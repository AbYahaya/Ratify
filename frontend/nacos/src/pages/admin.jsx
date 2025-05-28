import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', purpose: '', madeBy: '' });
  const [filters, setFilters] = useState({ name: '', reference: '', from: '', to: '' });
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState({ totalPayments: 0, totalWithdrawn: 0, balance: 0 });

  // Check session on mount
  useEffect(() => {
    axios.get('http://localhost:3000/api/admin/check', { withCredentials: true })
      .then(res => {
        if (res.data.loggedIn) {
          setLoggedIn(true);
          fetchData();
        }
      })
      .catch(() => setLoggedIn(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/admin/login', { password }, { withCredentials: true });
      if (res.data.success) {
        setLoggedIn(true);
        setMessage('');
        fetchData();
      } else {
        setMessage('Invalid password');
      }
    } catch {
      setMessage('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/admin/logout', {}, { withCredentials: true });
      setLoggedIn(false);
      setTransactions([]);
      setWithdrawals([]);
      setPassword('');
      setMessage('Logged out');
    } catch {
      setMessage('Logout failed');
    }
  };

  const fetchData = async () => {
    try {
      const { name, reference, from, to } = filters;
      const params = {};
      if (name) params.name = name;
      if (reference) params.reference = reference;
      if (from) params.from = from;
      if (to) params.to = to;

      const txRes = await axios.get('http://localhost:3000/api/admin/transactions', { params, withCredentials: true });
      const wdRes = await axios.get('http://localhost:3000/api/withdrawals', { params, withCredentials: true });

      setTransactions(txRes.data);
      setWithdrawals(wdRes.data);
      fetchSummary();
    } catch {
      setMessage('Failed to load data');
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/withdrawals/summary', { withCredentials: true });
      setSummary(res.data);
    } catch {
      console.error('Failed to fetch summary');
    }
  };

  const handleExportPDF = () => {
    const fromParam = filters.from ? `from=${filters.from}` : '';
    const toParam = filters.to ? `to=${filters.to}` : '';
    const query = [fromParam, toParam].filter(Boolean).join('&');
    const url = `http://localhost:3000/api/admin/export-pdf${query ? `?${query}` : ''}`;
    window.open(url, '_blank'); // open in new tab to send cookies properly
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/withdrawals/create', withdrawForm, { withCredentials: true });
      setMessage('✅ Withdrawal added');
      setWithdrawForm({ amount: '', purpose: '', madeBy: '' });
      fetchData();
    } catch {
      setMessage('❌ Error adding withdrawal');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchData();
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">Admin Dashboard</h2>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        <section className="mb-10 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-2xl font-semibold mb-4 text-purple-800">📊 Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-lg">
            <div className="bg-purple-50 p-4 rounded-md">
              <strong>Total Payments:</strong> ₦{summary.totalPayments.toLocaleString()}
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <strong>Total Withdrawn:</strong> ₦{summary.totalWithdrawn.toLocaleString()}
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <strong>Balance:</strong> ₦{summary.balance.toLocaleString()}
            </div>
          </div>
        </section>

        {/* Withdrawal Form */}
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

        {/* Filters */}
        <section className="mb-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">🔍 Filter Transactions</h3>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Filter by Name"
              value={filters.name}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              name="reference"
              placeholder="Filter by Reference"
              value={filters.reference}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-md"
            />
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-md"
            />
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-md"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
            >
              🧾 Export to PDF
            </button>
          </form>
        </section>

        {/* Transactions */}
        <section className="mb-10 bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">💳 Transactions</h3>
          {transactions.length > 0 ? (
            <ul className="space-y-3">
              {transactions.map((tx) => (
                <li
                  key={tx._id}
                  className="p-4 border border-blue-200 bg-blue-50 rounded-md"
                >
                  <strong>{tx.name}</strong> paid ₦{tx.amount.toLocaleString()} for <em>{tx.purpose}</em> on{' '}
                  <span className="text-sm text-gray-600">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No transactions available.</p>
          )}
        </section>

        {/* Withdrawals */}
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
