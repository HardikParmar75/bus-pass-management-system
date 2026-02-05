const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin.routes.js');
const userRoutes = require('./routes/user.routes.js');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});