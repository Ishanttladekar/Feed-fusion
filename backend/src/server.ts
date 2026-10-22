import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config/env';
import { connectDB } from './config/db';
import { seedDemoData } from './utils/seed';
import { socketService } from './services/socketService';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import oauthRoutes from './routes/oauthRoutes';
import feedRoutes from './routes/feedRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import credentialsRoutes from './routes/credentialsRoutes';
import followedRoutes from './routes/followedRoutes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

// Security & utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many login attempts, please try again later.' },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Feed Fusion API',
    mockModeDefault: config.mockModeDefault,
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/followed', followedRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
async function start() {
  await connectDB();
  await seedDemoData();

  server.listen(config.port, () => {
    console.log(`
======================================================
  🚀 Feed Fusion Server is running!
  🌐 URL: http://localhost:${config.port}
  📡 WebSocket: Enabled (Socket.io)
  ⚙️  Environment: ${config.nodeEnv}
  🎭 Mock Mode Default: ${config.mockModeDefault ? 'Enabled (Simulated feeds)' : 'Disabled'}
======================================================
    `);
  });
}

start();

export { app, server };
