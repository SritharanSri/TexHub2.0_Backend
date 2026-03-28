# TexHub - Backend

A RESTful API for the TexHub tailoring house management platform, built using Node.js and Express.

## 🚀 Features

- **Authentication**: JWT-based security with bcrypt.
- **Database**: PostgreSQL handled via Sequelize ORM.
- **Real-time**: Socket.io for chat and notifications.
- **File Uploads**: Admin and tailor file uploads (Multer).
- **Security**: CORS, Helmet, and rate limiting.
- **Validation**: Joi schemas for request validation.

## 🛠️ Tech Stack

- **Framework**: [Express.js](https://expressjs.com/)
- **Environment**: [Node.js](https://nodejs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Sequelize](https://sequelize.org/)
- **Real-time**: [Socket.io](https://socket.io/)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or later)
- [PostgreSQL](https://www.postgresql.org/) (Installed and running)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASS=your_db_pass
   DB_HOST=127.0.0.1
   JWT_SECRET=your_secret_key
   ```

3. Initialize the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

### Scripts

- `npm start`: Start the production server.
- `npm run dev`: Start the production server with nodemon.
- `npm run db:migrate`: Run database migrations.
- `npm run db:seed`: Seed the database with initial data.
- `npm run db:reset`: Undo all migrations, migrate again, and re-seed.

## 📄 License
MIT
