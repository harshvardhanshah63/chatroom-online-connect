const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8 // 100MB for file uploads
});

// Serve static files from current directory
app.use(express.static(__dirname));

// Route for main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Store online users
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Handle user joining
  socket.on('join', (nickname) => {
    console.log(`${nickname} is trying to join...`);
    
    socket.nickname = nickname;
    onlineUsers.set(socket.id, nickname);
    
    console.log(`Current online users: ${onlineUsers.size}`);
    console.log('Online users list:', Array.from(onlineUsers.values()));
    
    // Broadcast online count to ALL users including the one who just joined
    io.emit('onlineUsers', onlineUsers.size);
    
    // Welcome message to all other users
    socket.broadcast.emit('message', {
      nickname: 'System',
      msg: `${nickname} joined the chat`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      id: Date.now()
    });
    
    console.log(`${nickname} successfully joined the chat`);
  });

  // Handle messages
  socket.on('message', (data) => {
    console.log(`Received message from ${data.nickname}: ${data.msg}`);
    
    // Broadcast to all users except sender
    socket.broadcast.emit('message', {
      ...data,
      own: false
    });
    
    console.log(`Message broadcasted to ${onlineUsers.size - 1} other users`);
  });

  // Handle file uploads
  socket.on('file', (data) => {
    console.log(`Received file from ${data.nickname}: ${data.fileName}`);
    
    // Broadcast file to all users except sender
    socket.broadcast.emit('file', {
      ...data,
      own: false
    });
    
    console.log(`File broadcasted to ${onlineUsers.size - 1} other users`);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });

  // Handle user leaving
  socket.on('leave', (nickname) => {
    console.log(`${nickname} is leaving the chat`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnecting:', socket.id);
    
    if (socket.nickname) {
      const nickname = socket.nickname;
      onlineUsers.delete(socket.id);
      
      console.log(`${nickname} disconnected. Remaining users: ${onlineUsers.size}`);
      
      // Broadcast updated online count
      io.emit('onlineUsers', onlineUsers.size);
      
      // Leave message
      socket.broadcast.emit('message', {
        nickname: 'System',
        msg: `${nickname} left the chat`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        id: Date.now()
      });
    }
  });

  // Test connection
  socket.emit('connected', 'You are connected to the server');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🔗 Socket.IO is ready for connections`);
});