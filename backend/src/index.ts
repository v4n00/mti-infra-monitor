import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { authenticateToken } from './middleware/auth';
import dotenv from 'dotenv';
import { httpMetricsMiddleware, metricsHandler } from './monitoring';

dotenv.config();
const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Log when request starts
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${ip}`);

  // Log when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
  });

  next();
});

// monitor
app.use(httpMetricsMiddleware);
app.get("/metrics", metricsHandler);

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/uploads', express.static('uploads'));

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  const { method, originalUrl, ip } = req;
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] ERROR ${method} ${originalUrl} - ${ip}`);
  console.error(`[${timestamp}] Message: ${err.message}`);
  console.error(`[${timestamp}] Stack: ${err.stack}`);
  
  // Send error response
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = Number(process.env.PORT) || 2000;
const HOSTNAME = process.env.HOST_LISTEN || "localhost";

app.listen(PORT, HOSTNAME, () => {
  console.log(`Server running on http://${HOSTNAME}:${PORT}`);
  console.log('CORS enabled for all origins');
  if (process.env.BUILD_DATE) {
    console.log(`Build date: ${process.env.BUILD_DATE}`);
  } else {
    console.log('Build date not set');
  }
});

