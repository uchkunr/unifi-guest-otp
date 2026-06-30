const GuestWifi = require('../models/GuestWifi');

async function saveGuestWifi(payload, mac, phoneNumber, otp) {
  try {
    const guestRecord = {
      mac: mac || null,
      ip: null,
      essid: null,
      ap_mac: null,
      start_time: null,
      last_seen: null,
      phoneNumber: phoneNumber || null,
      otp: otp || null,
    };

    if (payload) {
      guestRecord.ip = payload.ip || payload.last_ip || null;
      guestRecord.essid = payload.essid || null;
      guestRecord.ap_mac = payload.ap_mac || null;
      guestRecord.start_time = payload.assoc_time || null;
      guestRecord.last_seen = payload.last_seen || null;
    }

    await GuestWifi.create(guestRecord);
  } catch (error) {
    console.log('An error occurred while saving guest WiFi record:', error.message);
    return null;
  }
}

module.exports = saveGuestWifi;
