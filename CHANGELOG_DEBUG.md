# SusuPay Change & Debug Log

## [2026-04-04] - Initial Core Deployment

### Added
- **Backend Models**: `User.js` (with bcrypt hashing) and `Transaction.js` created in `client/server/models`.
- **Directory Structure**: Created folders for routes, middleware, and frontend app routes (`auth`, `dashboard`).
- **Database Schema**: Prepared for UUID-based identification and decimal-precision financial tracking.
- **Frontend Auth**: Created `client/app/auth/page.tsx` with high-end emerald glassmorphism login UI.
- **MoMo Deposit Logic**: Created `client/components/MomoDeposit.tsx` featuring a 3-step secure deposit flow (Initiate -> Authorize -> Success) with provider selection for MTN, Telecel, and AT.
- **Backend Auth Routes**: Created `client/server/routes/auth.js` for secure registration and JWT-based login, including model synchronization in `index.js`.
- **Full-Stack Authentication**: Integrated `axios` on `Login` and `Register` pages with local storage persistence for JWT tokens and real-time error reporting.
- **Transaction API & Logic**: 
    - Created `client/server/routes/transactions.js` for MoMo deposits.
    - Connected `MomoDeposit.tsx` to the live API with unique TRX reference generation.
    - Implemented automatic balance updates on the `User` model.
- **Live Dashboard Sync**: Integrated real-time data fetching for user balance and transaction history using `Promise.all` for optimized performance.
- **Savings Management System**: 
    - Created `SavingsGoal` model and corresponding API routes.
    - Implemented dynamic goal tracking cards on the dashboard UI.
    - Created `CreateGoalModal.tsx` and integrated it into the dashboard for real-time goal initialization.
- **Automatic Data Refreshing**: Integrated a callback system (`onSuccess`) that triggers a dashboard-wide data re-fetch immediately after a successful MoMo deposit or new goal creation.
- **Admin Command Center**: 
    - Implemented `adminMiddleware` for RBAC.
    - Deployed system-wide overview API and Admin Registry.
    - Integrated Withdrawal Approval Workflow with real-time balance reconciliation.
- **Withdrawal & Payouts**: 
    - Created `WithdrawalRequest` model and modal for customer payout requests.
- **Collector Field Operations**:
    - Deployed Field Terminal (`/collector`) for recording cash collections.
    - Implemented Sequelize transactions for atomic cash-to-balance synchronization.
- **Automated Payments & Reporting**:
    - Created `paystack.js` webhook listener with HMAC signature verification.
    - Deployed **Financial Audit Hub** with CSV export capabilities for system-wide auditing.
- **Master Automation (Termux)**:
    - Optimized `start_termux.sh` (v2.0) with automated dependency checks and MariaDB initialization.
    - Added a real-time service health check loop to verify API and App connectivity upon launch.

### Debugging Notes
- **Startup Errors**: If the script fails at [1/5], run `npm install` in both `client` and `client/server`.
- **Port Conflicts**: Port cleanup now uses `fuser -k` to forcefully release 3030/5050 if they are locked by previous crashed sessions.
- **Webhook Security**: Verification uses `sha512`. Any signature mismatch will return `401 Unauthorized` without processing.
