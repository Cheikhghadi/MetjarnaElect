const jwt = require('jsonwebtoken');
const { isValidThreadId } = require('./utils/validate');

const socketHandler = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('AUTH_REQUIRED'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.id) {
        return next(new Error('AUTH_INVALID'));
      }
      socket.userId = String(decoded.id);
      next();
    } catch (e) {
      next(new Error('AUTH_INVALID'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_thread', (threadId) => {
      if (!isValidThreadId(threadId)) {
        return;
      }
      const [a, b] = threadId.split('_');
      if (a !== socket.userId && b !== socket.userId) {
        return;
      }
      socket.join(threadId);
    });

    socket.on('leave_thread', (threadId) => {
      if (typeof threadId === 'string') {
        socket.leave(threadId);
      }
    });

    socket.on('send_message', (data) => {
      if (!data || typeof data !== 'object') return;
      const { threadId } = data;
      if (!isValidThreadId(threadId)) return;
      const [a, b] = threadId.split('_');
      if (a !== socket.userId && b !== socket.userId) return;
      if (data.sender != null && String(data.sender) !== socket.userId) return;

      const payload = {
        ...data,
        sender: socket.userId,
      };
      socket.to(threadId).emit('receive_message', payload);
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = socketHandler;
