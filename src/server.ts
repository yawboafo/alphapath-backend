import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import logger from './utils/logger';
import db from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import communityRoutes from './routes/community.routes';
import paymentRoutes from './routes/payment.routes';
import userRoutes from './routes/user.routes';
import statsRoutes from './routes/stats.routes';
import sectionRoutes from './routes/section.routes';
import reviewRoutes from './routes/review.routes';

class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
      })
    );

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting - disabled for testing
    // this.app.use('/api', apiLimiter);

    // Request logging
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.body,
      });

      // Capture the original send function
      const originalSend = res.send;
      res.send = function(data: any): any {
        const duration = Date.now() - startTime;
        logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
          duration: `${duration}ms`,
          response: typeof data === 'string' ? JSON.parse(data) : data,
        });
        return originalSend.call(this, data);
      };

      next();
    });
  }

  private configureRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/courses', courseRoutes);
    this.app.use('/api/courses', reviewRoutes);
    this.app.use('/api/community', communityRoutes);
    this.app.use('/api/payments', paymentRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/stats', statsRoutes);
    this.app.use('/api', sectionRoutes);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'AlphaPath Academy API',
        version: '1.0.0',
        documentation: '/api/docs',
      });
    });
  }

  private configureErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Test database connection
      const dbConnected = await db.testConnection();
      if (!dbConnected) {
        throw new Error('Failed to connect to database');
      }

      // Start server
      this.app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`);
        logger.info(`Environment: ${config.nodeEnv}`);
        logger.info(`API URL: ${config.apiUrl}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    await db.close();
    logger.info('Server stopped');
  }
}

// Create and start server
const server = new Server();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await server.stop();
  process.exit(0);
});

// Start the server
server.start();

export default server;
