const axios = require('axios');

const axiosRetry = require('axios-retry').default;
const https = require('node:https');
const dotenv = require('dotenv');

dotenv.config();

class UnifiController {
  constructor(config) {
    this.host = config.host;
    this.port = config.port;
    this.username = config.username;
    this.password = config.password;
    this.baseURL = `https://${this.host}:${this.port}`;
    this.site = 'default';

    this.cookies = null;
    this.lastLoginTime = null;
    this.sessionTimeout = 3600000;

    // Disable SSL certificate verification
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    this.api = axios.create({
      baseURL: this.baseURL,
      httpsAgent: this.httpsAgent,
      timeout: 10000,
    });

    axiosRetry(this.api, {
      retries: 2,
      retryDelay: (retryCount) => {
        return retryCount * 1000;
      },
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429 ||
          error.code === 'ECONNABORTED' ||
          !error.response
        );
      },
    });
  }

  isSessionValid() {
    if (!this.cookies || !this.lastLoginTime) {
      return false;
    }

    const currentTime = Date.now();
    const sessionAge = currentTime - this.lastLoginTime;

    return sessionAge < this.sessionTimeout;
  }

  async login() {
    try {
      if (this.isSessionValid()) {
        return this.cookies;
      }

      const response = await this.api.post('/api/login', {
        username: this.username,
        password: this.password,
      });

      this.cookies = response.headers['set-cookie'];
      this.lastLoginTime = Date.now();

      return this.cookies;
    } catch (error) {
      console.error('Login error:', error.message);
      this.cookies = null;
      this.lastLoginTime = null;
      return null;
    }
  }

  // Logout
  async logout() {
    if (!this.cookies) return;

    try {
      await this.api.post(
        '/api/logout',
        {},
        {
          headers: {
            Cookie: this.cookies.join(';'),
          },
        },
      );

      this.cookies = null;
      this.lastLoginTime = null;
    } catch (error) {
      console.error('Logout error:', error.message);
      return null;
    }
  }

  async apiRequest(method, endpoint, data = null) {
    try {
      if (!this.isSessionValid()) {
        await this.login();
      }

      const config = {
        method,
        url: endpoint,
        headers: {
          Cookie: this.cookies.join(';'),
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await this.api(config);
      return response.data;
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        this.cookies = null;
        await this.login();

        const config = {
          method,
          url: endpoint,
          headers: {
            Cookie: this.cookies.join(';'),
          },
        };

        if (data) {
          config.data = data;
        }

        const response = await this.api(config);
        return response.data;
      }

      throw error;
    }
  }

  async authorizeGuest(macAddress, minutes = 60) {
    try {
      const endpoint = `/api/s/${this.site}/cmd/stamgr`;
      const data = {
        cmd: 'authorize-guest',
        mac: macAddress.toLowerCase().trim(),
        minutes: parseInt(minutes, 10),
      };

      const response = await this.apiRequest('post', endpoint, data);
      return response;
    } catch {
      return null;
    }
  }

  /**
   * Get client device information with axios-retry mechanism
   */
  async getClientDevice(macAddress) {
    const normalizedMac = macAddress.toLowerCase().trim();
    const endpoint = `/api/s/${this.site}/stat/user/${normalizedMac}`;

    try {
      const response = await this.apiRequest('get', endpoint);

      if (response?.data && response.data.length > 0) {
        console.log('Client informations: ', response);
        return response.data[0];
      }

      return null;
    } catch (error) {
      console.error('Error retrieving user details:', error.message);
      return null;
    }
  }

  hasValidData(response) {
    return response?.data && Array.isArray(response.data) && response.data.length > 0;
  }
}

// UniFi Controller instance
const controller = new UnifiController({
  host: process.env.UNIFI_HOST,
  port: process.env.UNIFI_PORT,
  username: process.env.UNIFI_USERNAME,
  password: process.env.UNIFI_PASSWD,
});

/**
 * Authorize a guest on the WiFi network
 */
async function authorizeGuestWifi(macAddress) {
  try {
    return await controller.authorizeGuest(
      macAddress.toLowerCase().trim(),
      process.env.TIME_OF_USE,
    );
  } catch (error) {
    console.error('Error granting user access:', error);
    return null;
  }
}

/**
 * Get client device information
 */
async function getClient(macAddress) {
  try {
    const response = await controller.getClientDevice(macAddress.toLowerCase().trim());
    return response;
  } catch (error) {
    console.error('Error retrieving user details:', error);
    return null;
  }
}

module.exports = {
  authorizeGuestWifi,
  getClient,
};
