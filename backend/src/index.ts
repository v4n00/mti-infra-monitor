import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { authenticateToken } from './middleware/auth';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const ALLOWED_ORIGINS='*';

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = Number(process.env.PORT) || 2000;
const HOSTNAME = process.env.HOSTNAME || "localhost";

app.listen(PORT, HOSTNAME, () => {
  console.log(`Server running on http://${HOSTNAME}:${PORT}`);
  console.log(`Allowed CORS origins: ${ALLOWED_ORIGINS}`);
  if (process.env.BUILD_DATE) {
    console.log(`Build date: ${process.env.BUILD_DATE}`);
  } else {
    console.log('Build date not set');
  }
});

