// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Add this to your server setup if not already in place
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/receipts', express.static('receipts'));

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