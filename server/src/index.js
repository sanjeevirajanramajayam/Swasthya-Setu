import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import workerRoutes from './routes/workers.js';
import encounterRoutes from './routes/encounters.js';
import appointmentRoutes from './routes/appointments.js';
import consentRoutes from './routes/consent.js';
import governanceRoutes from './routes/governance.js';
import hospitalRoutes from './routes/hospitals.js';
import { runMigrations } from './db/init.js';
import { seedDatabase } from './db/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SWASTHYA SETU - Migrant Worker Digital Health & Governance Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start Server
async function startServer() {
  try {
    console.log('[Server] Connecting to database and running seed checks...');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🏥 SWASTHYA SETU BACKEND SERVER RUNNING ON PORT ${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Server Startup Failure]:', err);
    process.exit(1);
  }
}

startServer();
