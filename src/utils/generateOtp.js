const crypto = require('node:crypto');

module.exports = function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
};
