const express = require('express');
const router = express.Router();
const otpLimiter = require('../middleware/otpLimiter.js');

const { requestOTP, verifyOTP } = require('../controllers/authController');

router.post('/request-otp', otpLimiter, requestOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
