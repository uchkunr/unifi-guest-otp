# Contributing to UniFi Guest Wi-Fi OTP Gateway

Thank you for taking the time to contribute to this project. Please review the guidelines below to ensure a smooth, professional development workflow.

## Code of Conduct

We aim to foster an open, welcoming, and productive collaborative environment. Please treat all contributors with respect.

## Git Workflow

We use a standard branching model:

1. **Master Branch**: `master` contains the latest stable release code.
2. **Feature Branches**: Create feature or bugfix branches from `master`. Name your branches with prefixes:
   - `feature/your-feature-name` for new features.
   - `bugfix/issue-description` for bug fixes.
   - `chore/update-dependencies` for maintenance tasks.

### Commit Messages

We recommend following the Conventional Commits specification. This helps maintain clear, automated release logs:

- `feat: add support for local SMS gateways`
- `fix: correct Redis timeout configuration`
- `docs: update setup steps in README`
- `chore: bump dependency versions`

---

## Local Development Guidelines

1. **Code Style**:
   - Write clean CommonJS modules as defined in `package.json` (`"type": "commonjs"`).
   - Use clean, asynchronous Node.js patterns (async/await) and handle errors explicitly.
   - Do not commit secrets, environment variables, or private certificates. Keep them in `.env`.

2. **Database Migrations & Models**:
   - If you modify the `GuestWifi` model, ensure the changes map correctly to database schemas.

3. **Submitting Changes**:
   - Run the application locally and perform verification tests for both success and error flows.
   - Push your branch to the repository and open a Pull Request (PR) against `main`.
   - Provide a clear, structured description in the PR detailing what changes were made and why.
