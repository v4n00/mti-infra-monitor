import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { authenticateToken } from './middleware/auth';
import dotenv from 'dotenv';

dotenv.config(); // load .env
const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/users', userRoutes);

// Protected routes
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});