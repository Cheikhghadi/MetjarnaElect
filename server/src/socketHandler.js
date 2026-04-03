const Message = require('./models/Message');
const { decrypt } = require('./utils/encryption');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a conversation room
    socket.on('join_thread', (threadId) => {
      socket.join(threadId);
      console.log(`User joined thread: ${threadId}`);
    });

    // Send a message via socket
    socket.on('send_message', (data) => {
      // data: { threadId, senderName, content, createdAt }
      // The message is already saved to DB via REST API before this is called
      // We just broadcast it to the room
      socket.to(data.threadId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
