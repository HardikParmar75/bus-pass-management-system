const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin.routes.js');
const userRoutes = require('./routes/user.routes.js');
const logger = require('./utils/logger.js');
const httpLog = require('./middleware/httpLog.js');

dotenv.config();
const app = express();

// CORS configuration for phone access
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from localhost and any IP on local network
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8000',
      /^http:\/\/127\.0\.0\.1:\d+$/, // Allow localhost with any port
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow local network IPs (192.168.x.x)
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,   // Allow 10.x.x.x network
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+:\d+$/, // Allow 172.16-31.x.x network
    ];

    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      return allowed.test(origin);
    })) {
      callback(null, true);
    } else {
      logger.warn(`CORS request blocked from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(httpLog);

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
}).then(() => {
    logger.success('Connected to MongoDB', { uri: MONGO_URI.substring(0, 50) + '...' });
}).catch((err) => {
    logger.error('Error connecting to MongoDB:', { error: err.message });
});

app.get('/', (req, res) => {
    res.send('Bus Pass Management System API is running');
});

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running 🚀" ,message:"Health API Running..."});
});

// Admin routes
app.use('/api/admin', adminRoutes);

// User routes
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
    logger.success(`Server is running on port ${PORT}`);
    logger.info('Environment:', { NODE_ENV: process.env.NODE_ENV || 'development' });
    logger.info(`To access from phone on same network, use: http://<YOUR_IP>:${PORT}`);
});