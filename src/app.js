const express = require('express');
const dotenv = require('dotenv');
// const path = require('node:path'); // Retained for serving production build of client UI in the future
const authRoutes = require('./routes/authRoutes');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Initialize Environment Variables
dotenv.config();

// Configure Double Submit Cookie CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

const app = express();

// Global Middleware Setup
app.use(cookieParser()); // Required by CSRF double submit cookie check
app.use(express.json()); // Body parser for incoming JSON payloads

/**
 * Route to fetch a valid CSRF token.
 * Client must request this token first and send it in headers for write requests (POST).
 */
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Authentication routes (OTP requests and OTP verification)
app.use('/api', authRoutes);

/**
 * Health check endpoint for container environments and status probes.
 */
app.get('/health', (_req, res) => {
  res.send('Server is live!');
});

// Production environment static files serving configuration
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../../ui/dist')));
//   app.get(/.*/, (_req, res) => {
//     res.sendFile(path.join(__dirname, '../../ui/dist/index.html'));
//   });
// }

// Global error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Unexpected server error' });
});

module.exports = app;
