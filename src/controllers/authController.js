const { authorizeGuestWifi, getClient } = require('../services/unifiService');
const redis = require('../database/redis');
const { sendSMS } = require('../services/smsService');
const saveGuestWifi = require('../utils/saveGuestWifi');
const generateOTP = require('../utils/generateOtp');

async function requestOTP(req, res) {
  const { phoneNumber } = req.body;
  try {
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    const otp = generateOTP();
    await redis.set(`otp:${phoneNumber}`, otp, 'EX', 60);

    const smsResult = await sendSMS(
      phoneNumber,
      `${otp} Kod tasdiqlash uchun. Wi-Fi tarmog‘iga ulanishingiz uchun.`,
    );

    if (!smsResult.success) {
      return res.status(500).json({ success: false, message: 'Error sending SMS' });
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function verifyOTP(req, res) {
  const { phoneNumber, otp, macAddress } = req.body;
  try {
    const storedOTP = await redis.get(`otp:${phoneNumber}`);

    if (!storedOTP) {
      return res.status(410).json({
        success: false,
        message: 'OTP not requested or expired',
      });
    }

    if (storedOTP !== otp) {
      console.info('Incorrect OTP');
      return res.status(401).json({ success: false, message: 'Incorrect OTP' });
    }

    await redis.del(`otp:${phoneNumber}`);

    const authResult = await authorizeGuestWifi(macAddress);

    if (!authResult) {
      return res.status(500).json({ success: false, message: 'Error connecting to WiFi' });
    }

    const clientPayload = await getClient(macAddress);
    await saveGuestWifi(clientPayload, macAddress, phoneNumber, otp);

    console.log(`${phoneNumber} successfully connected to the internet for MAC: ${macAddress}`);

    res.json({ success: true, message: 'Successfully connected to WiFi' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  requestOTP,
  verifyOTP,
  generateOTP,
};
