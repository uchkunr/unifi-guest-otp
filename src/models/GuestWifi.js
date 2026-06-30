const { DataTypes } = require('sequelize');
const sequelize = require('../database/mysql');

const GuestWifi = sequelize.define(
  'GuestWifi',
  {
    mac: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true, // Last assigned IP address of the client
    },
    essid: {
      type: DataTypes.STRING,
      allowNull: true, // The SSID (Wi-Fi network name) the client is connected to
    },
    ap_mac: {
      type: DataTypes.STRING,
      allowNull: true, // The MAC address of the Access Point (AP) the client is connected to
    },
    start_time: {
      type: DataTypes.INTEGER,
      allowNull: true, // Timestamp when the client first connected (assoc_time)
    },
    last_seen: {
      type: DataTypes.INTEGER,
      allowNull: true, // Timestamp when the client was last seen in the network
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true, // Phone number associated with the guest client
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true, // OTP (One-Time Password) used for authentication
    },
  },
  {
    tableName: 'guest_wifi',
    timestamps: true,
  },
);

module.exports = GuestWifi;
