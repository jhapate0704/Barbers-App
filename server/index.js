const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { Server } = require('socket.io');

// 1. Initialize the Express application
const app = express();

// 2. Apply Middleware
app.use(cors()); // Allows your React app to talk to this server
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Create the HTTP server (required for Socket.io)
const server = http.createServer(app);

// 4. Initialize Socket.io for the "Live Queue" Bump-Up feature
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // The default Vite React port
    methods: ["GET", "POST"]
  }
});

app.use((req, res, next) => {
  req.io = io; // This attaches the socket server to every request!
  next();
}); 

const salonRoutes = require('./routes/salon_routes.js');
app.use('/api/salons', salonRoutes);

const userRoutes = require('./routes/user_routes.js');
app.use('/api/users', userRoutes);

const bookingRoutes = require('./routes/booking_routes.js');
app.use('/api/bookings', bookingRoutes); 

// Listen for users connecting to the app
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // We will add specific events here later (e.g., 'barber_finished_early')
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// 5. Connect to Database and start the server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    
    // Only start listening if the database connects successfully
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

// 6. Basic Test Route to verify API is working
app.get('/', (req, res) => {
  res.send('TrimSync API is running! 💈');
});