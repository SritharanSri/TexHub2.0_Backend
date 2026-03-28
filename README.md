# TexHub 2.0 - Backend

The core API and real-time communication server for the TexHub platform. Built on Node.js and Express, it provides secure endpoints for user management, order processing, with real-time updates via Socket.io.

## 🚀 Features

- **Authentication**: JWT-based security with role-based access control (Admin, Tailor, Customer).
- **Database**: [Sequelize ORM](https://sequelize.org/) with PostgreSQL integration.
- **File Uploads**: [Multer](https://github.com/expressjs/multer) for managing order designs & user avatars.
- **Real-time**: [Socket.io](https://socket.io/) for chat and instant order notifications.
- **Security**: [Helmet](https://helmetjs.github.io/), CORS, and rate limiting (Express-rate-limit).
- **Validation**: [Joi](https://joi.dev/) for robust request payload validation.
- **Emailing**: [Nodemailer](https://nodemailer.com/) for automated system notifications.

## 🛠️ Tech Stack

- **Platform**: [Node.js](https://nodejs.org/) v18+
- **Framework**: [Express.js](https://expressjs.com/) v5+
- **ORM**: [Sequelize](https://sequelize.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Networking**: [Socket.io](https://socket.io/)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) (Running instances)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SritharanSri/TexHub2.0_Backend.git
   cd TexHub2.0_Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASS=your_db_pass
   DB_HOST=127.0.0.1
   JWT_SECRET=your_secret_key
   ```

4. Initialize the database:
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License
This project is for demonstration/internal purposes. All rights reserved.
