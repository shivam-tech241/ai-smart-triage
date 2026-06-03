import 'dotenv/config'; // Loads variables from backend/.env or root
import express from 'express';
import cors from 'cors';
import db from './db/db.js'; // Ensure database is initialized on load

import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend calls
app.use(cors({
  origin: '*', // For demo compatibility
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Route mounts
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);

// Base status check
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Triage backend service is running.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`SmartTriage backend server running on http://localhost:${PORT}`);
});
