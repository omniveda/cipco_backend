const express = require("express");
const cors = require("cors");
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

const corsOptions = {
    origin: [
      "http://localhost:3000",
      "https://www.cipcopharma.com",
      "http://localhost:5173",
      "https://mrgamblers.com",
      "https://www.mrgamblers.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  };

app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://cipcolimited_db_user:2vWtikBrDIZCLxZL@cluster0.dqs6jwz.mongodb.net/cipco', {
  bufferTimeoutMS: 60000,
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('Connected to MongoDB');

  // Blog routes
  app.use('/api/blogs', blogRoutes);

  // Contact routes
  app.use('/api/contacts', contactRoutes);

  // Auth routes
  app.use('/api/auth', authRoutes.router);

  // Admin routes
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit the process if MongoDB connection fails
});
