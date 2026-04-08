# SusuPay Web Platform

SusuPay is a digital savings and collector management platform built to modernize traditional Susu savings collection systems. This web endpoint serves as the backend infrastructure and frontend dashboard utility supporting administrative controls, customer metrics, and collector terminal operations.

---

## 🏗️ Project Structure

The project is split into two main components:

- **`client/`**: Next.js based Frontend Web Application.
- **`server/`**: Node.js/Express based Backend REST API.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [XAMPP](https://www.apachefriends.org/) or MySQL local server
- NPM (comes with Node.js)

### 1. Database Configuration
1. Start **MySQL** via XAMPP Control Panel.
2. Create a database named `susu_pay_db`.
3. Check `server/.env` to ensure your local connection details match:
   ```env
   PORT=5050
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=susu_pay_db
   JWT_SECRET=your_secret_key
   ```

### 2. Backend Setup
Navigate into the server folder and install dependencies:
```bash
cd server
npm install
```
To start in development mode (auto-reload):
```bash
npm run dev
```
*The API is now online at [http://localhost:5050](http://localhost:5050).*

---

### 3. Frontend Setup
Navigate into the client folder and install dependencies:
```bash
cd client
npm install
```
To start the React/Next development server:
```bash
npm run dev
```
*The App is now accessible at [http://localhost:3030](http://localhost:3030).*

---

## 🛠️ Tech Stack & Dependencies

### Frontend (`client/`)
- **Framework**: Next.js 16+ (React 19)
- **Styling**: TailwindCSS via PostCSS
- **Communication**: Axios REST client
- **Icons**: Lucide Icons

### Backend (`server/`)
- **Runtime**: Node.js v18+
- **REST Framework**: Express.js 5+
- **Database ORM**: Sequelize with MySQL2
- **Utilities**:
  - `bcryptjs`: Password Hashing
  - `jsonwebtoken`: Authentication Tokenization
  - `multer`: File Upload handlers
  - `morgan`: Request Logger

---

## 📋 Features Overview

- **Dashboards**: Integrated analytics layouts across Admin, Customer, and Collector viewports.
- **Customer Savings Trackers**: Highlighting wealth builders tracking milestones goals easily.
- **Form Validation Centers**: Requesting withdrawals and verification compliance auditing safely.
- **Performance Grids**: Track speed benchmarking aggregates auditing transactions efficiently.

---

## 📜 Shortcuts
Use absolute batch scripts listed at folder root to start/stop quickly avoiding terminal navigations for day-to-day restarts:
1. `start_app.cmd` - Clears crashed PID locks automatically and starts both Node+Next servers quickly together!

---

*Created supportively for SusuPay.*
