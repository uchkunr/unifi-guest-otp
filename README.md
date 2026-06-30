# UniFi Guest Wi-Fi OTP Gateway

An API gateway that manages guest Wi-Fi authentication on UniFi networks via SMS-based One-Time Passwords (OTP). It integrates with a UniFi Controller, SMS API, Redis (for OTP verification cache and rate-limiting), and MySQL (for connection logging and session history).

## Features

- **OTP Generation & Verification**: Generates secure 6-digit random codes cached in Redis with a 60-second expiration.
- **SMS Gateway Integration**: Delivers the OTP to the guest's mobile device.
- **UniFi Authorization**: Authorizes the guest device on the UniFi network for a configurable duration.
- **Connection History**: Logs client details (IP, MAC, Access Point MAC, ESSID, phone number, timestamps) to MySQL.
- **Security & Stability**: Out-of-the-box CSRF protection, endpoint rate limiting, and robust Axios retry mechanisms for UniFi controller communication.

---

## Tech Stack

- **Runtime**: Node.js (>= 24)
- **Framework**: Express (v5.x)
- **Databases**: MySQL (via Sequelize ORM) & Redis (via ioredis)
- **Containerization**: Docker & Docker Compose

---

## Getting Started

### Prerequisites

- Node.js >= 24
- npm >= 11
- Running MySQL instance
- Running Redis instance
- Access to a UniFi Controller (with guest portal enabled)
- Credentials for an SMS Gateway API

### Setup Environment Variables

Copy `.env.example` to `.env` and fill in the required variables:

```bash
cp .env.example .env
```

Key environment configurations:

- `NODE_ENV`: Set to `development` or `production`
- `PORT` & `HOST`: Port and host interface for the API
- `REDIS_URL`: Connection string for Redis (e.g., `redis://localhost:6379`)
- `DB_*`: MySQL connection details
- `SMS_API_*`: Credentials and endpoint for your SMS gateway
- `UNIFI_*`: Host, port, and credentials for your UniFi Controller
- `TIME_OF_USE`: Guest session duration in minutes (e.g., `120` for 2 hours)

### Installation

Install dependencies:

```bash
npm install
```

### Running Locally

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

The application will start on `http://localhost:3000` (or the port defined in `.env`).

---

## Running with Docker

You can spin up the entire stack (API, MySQL, and Redis) using Docker Compose.

1. Configure your host `.env` file with the target UniFi and SMS credentials.
2. Start the services:

```bash
docker compose up -d --build
```

This starts:

- **`unifi-guest-otp-api`** on port `3000`
- **`unifi-guest-otp-db`** on port `3306` (data persisted in `db_data` volume)
- **`unifi-guest-otp-redis`** on port `6379` (data persisted in `redis_data` volume)

---

## API Documentation

### 1. Request OTP

- **Endpoint**: `POST /api/request-otp`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "phoneNumber": "+998901234567"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```

### 2. Verify OTP

- **Endpoint**: `POST /api/verify-otp`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "phoneNumber": "+998901234567",
    "otp": "123456",
    "macAddress": "aa:bb:cc:dd:ee:ff"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Successfully connected to WiFi"
  }
  ```

### 3. CSRF Token

- **Endpoint**: `GET /api/csrf-token`
- **Response** (200 OK): Returns a fresh CSRF token.

### 4. Health Check

- **Endpoint**: `GET /health`
- **Response** (200 OK): `Server is live!`

---

## Codebase Structure

```
├── Dockerfile
├── docker-compose.yml
├── package.json
└── src
    ├── app.js                 # App configuration & middleware pipeline
    ├── index.js               # Database sync & server startup entrypoint
    ├── controllers
    │   └── authController.js  # OTP request & verification logic
    ├── database
    │   ├── mysql.js           # MySQL Sequelize initializer
    │   └── redis.js           # ioredis client
    ├── middleware
    │   └── otpLimiter.js      # Rate limiting config for OTP endpoints
    ├── models
    │   └── GuestWifi.js       # Sequelize model for logging guest sessions
    ├── routes
    │   └── authRoutes.js      # Endpoint routing definition
    ├── services
    │   ├── smsService.js      # SMS provider gateway interface
    │   └── unifiService.js    # UniFi Controller authentication client
    └── utils
        ├── generateOtp.js     # Secure 6-digit random code generator
        └── saveGuestWifi.js   # DB connection logging helper
```
