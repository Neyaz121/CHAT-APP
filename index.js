const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:5500", // your frontend origin
        methods: ["GET", "POST"]
    }
});

// Apply CORS to Express (not socket directly)
app.use(cors());

const users = {};

io.on('connection', socket => {
    console.log('New connection:', socket.id);

    // If any new user joined, let other users know
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    // If someone sends a message, broadcast it
    socket.on('send', message => {
        socket.broadcast.emit('receive', {
            message: message,
            name: users[socket.id]
        });
    });

    // If someone leaves the chat
    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});

// Start server
server.listen(8000, () => {
    console.log("Server is running on http://localhost:5500");
});
