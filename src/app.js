const express = require('express');
const dotenv = require('dotenv');
const path = require('node:path');
const authRoutes = require('./routes/authRoutes');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api', authRoutes);

app.get('/health', (_req, res) => {
  res.send('Server is live!');
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../ui/dist')));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(__dirname, '../../ui/dist/index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Unexpected server error' });
});

module.exports = app;
