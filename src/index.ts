import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dns from 'dns';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { requestIdMiddleware } from './middleware/request-id';
import { errorHandler } from './middleware/error-handler';

// Routes
import healthRoutes from './routes/health.routes';
import waitlistRoutes from './routes/waitlist.routes';
import contactRoutes from './routes/contact.routes';

const app = express();

// Set trust proxy for Render/Cloudflare to get correct client IP
app.set('trust proxy', true);

// Set DNS to use Google's public DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Security & Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    exposedHeaders: ['x-request-id'],
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(requestIdMiddleware);

// API Routes
const apiPrefix = env.API_PREFIX;
app.use(`${apiPrefix}/health`, healthRoutes);
app.use(`${apiPrefix}/waitlist`, waitlistRoutes);
app.use(`${apiPrefix}/contact`, contactRoutes);

// Error Handling
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();

  const port = env.PORT;
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${apiPrefix}`);
  });
};

void startServer();
