require('dotenv').config();

const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const { initSocket } = require('./utils/socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models in development (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    }

    server.listen(PORT, () => {
      console.log(`TexHub API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

start();
