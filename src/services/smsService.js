const axios = require('axios');
const { v7 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

async function sendSMS(phoneNumber, message) {
  try {
    const response = await axios.post(
      process.env.SMS_API_URL,
      {
        header: {
          login: process.env.SMS_API_LOGIN,
          pwd: process.env.SMS_API_PWD,
          CgPN: process.env.SMS_API_CgPN,
        },
        body: {
          message_id_in: v7(),
          CdPN: phoneNumber,
          text: message,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendSMS,
};
