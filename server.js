const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Create Uploads folder if it doesn't exist
if (!fs.existsSync('Uploads')) {
  fs.mkdirSync('Uploads');
}

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/user', require('./routes/user'));
app.use('/api/exercise', require('./routes/exercise'));
app.use('/api/friends', require('./routes/friends'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ msg: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});