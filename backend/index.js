import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});