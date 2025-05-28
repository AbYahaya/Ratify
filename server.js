// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const transactionController = require('./controllers/transactionController');

const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware - must come before routes
app.use(cors({
  origin: 'http://localhost:5173', // your React app URL
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Session middleware - must come before routes
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
}));

// Routes - after CORS and session middleware
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/receipts', express.static('receipts'));
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/account', accountRoutes);

// Explicit admin auth routes (you can move these to adminRoutes if preferred)
app.post('/api/admin/login', transactionController.adminLogin);
app.post('/api/admin/logout', transactionController.adminLogout);
app.get('/api/admin/check', transactionController.adminCheck);
app.get('/api/admin/transactions', transactionController.isAdminAuthenticated, transactionController.getAllTransactions);

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the Ratify');
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).send('Route not found');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//module.exports = app;
