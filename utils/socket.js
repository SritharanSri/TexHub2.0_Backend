const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log('New client connected:', socket.id, 'User:', userId);

    // Join private room for global notifications
    socket.join(userId);
    console.log(`User ${userId} joined their private notification room`);

    socket.on('join_order_chat', (orderId) => {
      if (orderId) {
        socket.join(orderId);
        console.log(`Socket ${socket.id} joined room: ${orderId}`);
      }
    });

    socket.on('leave_order_chat', (orderId) => {
      if (orderId) {
        socket.leave(orderId);
        console.log(`Socket ${socket.id} left room: ${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
