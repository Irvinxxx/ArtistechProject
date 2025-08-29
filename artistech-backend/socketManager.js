const { getDB } = require('./config/db');
let io;

const onlineUsers = new Map();

const initializeSocket = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user registration for private messaging
    socket.on('registerUser', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User registered with ID: ${userId} and Socket ID: ${socket.id}`);
      socket.join(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    // Join a project room - REMOVED
    /*
    socket.on('join_project_room', (projectId) => {
      socket.join(`project-${projectId}`);
    });
    */

    // Leave a project room - REMOVED
    /*
    socket.on('leave_project_room', (projectId) => {
      socket.leave(`project-${projectId}`);
    });
    */

    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, messageText, projectId } = data; // Updated to match frontend
        const db = getDB();

        try {
            const insertQuery = `
                INSERT INTO messages (sender_id, receiver_id, message_text, message_type, project_id) 
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await db.execute(insertQuery, [senderId, receiverId, messageText, 'text', projectId || null]);

            const selectQuery = 'SELECT m.id, m.sender_id, m.receiver_id, m.message_text, m.message_type, m.file_url, m.created_at, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?';
            const [rows] = await db.execute(selectQuery, [result.insertId]);
            const newMessage = rows[0];

            // Send to individuals
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newMessage', newMessage);
            }
            // Also send back to the sender to confirm it was sent
            socket.emit('newMessage', newMessage);

            // Handle notifications
            if (receiverId) {
                const [senderRows] = await db.execute('SELECT name FROM users WHERE id = ?', [senderId]);
                const senderName = senderRows.length > 0 ? senderRows[0].name : 'A user';
                
                let notificationMessage = `You have a new message from ${senderName}.`;
                let link = `/messages/${senderId}`; // Link to the conversation
                
                if (projectId) {
                    notificationMessage = `New message in your project from ${senderName}.`;
                    link = `/project/${projectId}`;
                }
                // Use the new centralized utility
                const { createAndEmitNotification } = require('../utils/createNotification');
                await createAndEmitNotification(
                    receiverId,
                    notificationMessage,
                    link
                );
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const getSocketId = (userId) => {
    return onlineUsers.get(userId);
}

const emitToUser = (userId, event, data) => {
    const socketId = getSocketId(userId);
    if (socketId) {
        io.to(socketId).emit(event, data);
    }
}

module.exports = {
    initializeSocket,
    getIo,
    getSocketId,
    emitToUser, // Export emitToUser
    onlineUsers
};
