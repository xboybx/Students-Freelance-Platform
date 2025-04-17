import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json()); // For parsing JSON requests

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Freelancing');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define Message schema and model
const messageSchema = new mongoose.Schema({
    bookingId: String,
    senderId: String,
    content: String,
    timestamp: Date,
});
const Message = mongoose.model('Message', messageSchema);

// Create HTTP server and Socket.IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'] // Explicitly enable WebSocket transport
});

// Store active chat rooms
const chatRooms = new Map();

// API endpoint to fetch messages for a specific booking
app.get('/messages/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    try {
        const messages = await Message.find({ bookingId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Enhanced Socket.IO connection handling for mentor-student chat
io.on('connection', (socket) => {
    // Get connection parameters with fallback to test values
    const {
        bookingId = 'test-booking',
        userId = 'test-user',
        userType = 'test'
    } = socket.handshake.query;

    console.log(`Connection established - Booking: ${bookingId}, User: ${userId}, Type: ${userType}`);

    // Verify booking acceptance (in a real app, you'd check database)
    console.log(`${userType} ${userId} connected for booking ${bookingId}`);

    // Join the booking-specific room
    socket.join(bookingId);

    // Notify other participant about new connection
    socket.to(bookingId).emit('user-connected', { userId, userType });

    // Handle incoming chat messages
    socket.on('chat-message', async (message) => {
        try {
            // Validate message structure
            if (!message.content || !message.senderId) {
                throw new Error('Invalid message format');
            }

            // Create and save message to database
            const newMessage = new Message({
                bookingId,
                senderId: message.senderId,
                content: message.content,
                timestamp: new Date(),
                userType: message.userType // Store if sender is mentor/student
            });

            await newMessage.save();

            // Broadcast message to both participants
            io.to(bookingId).emit('chat-message', {
                ...message,
                timestamp: newMessage.timestamp
            });
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('error', 'Failed to send message');
        }
    });

    // Handle typing indicators
    socket.on('typing', (isTyping) => {
        socket.to(bookingId).emit('typing', {
            userId,
            isTyping
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`${userType} ${userId} disconnected from booking ${bookingId}`);
        socket.to(bookingId).emit('user-disconnected', { userId });
    });
});

// Start the server
const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
