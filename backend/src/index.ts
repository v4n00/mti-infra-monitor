import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { authenticateToken } from './middleware/auth';
import dotenv from 'dotenv';

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

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/uploads', express.static('uploads'));

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

