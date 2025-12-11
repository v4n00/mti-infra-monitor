import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Import metrics from monitoring module
import { httpErrorTotal, loginAttemptsTotal, trackDbQuery } from '../monitoring';

router.post('/signup', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    httpErrorTotal.inc({ method: req.method, route: '/users/signup', status_code: 400 });
    console.error(`[${new Date().toISOString()}] Email and password required for signup`);
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const existingUser = await trackDbQuery('user_findUnique', () => 
      prisma.user.findUnique({ where: { email } })
    );
    if (existingUser) {
      httpErrorTotal.inc({ method: req.method, route: '/users/signup', status_code: 400 });
      console.error(`[${new Date().toISOString()}] Signup failed - user already exists with email`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await trackDbQuery('user_create', () => 
      prisma.user.create({
        data: { email, password: hashedPassword },
      })
    );

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    loginAttemptsTotal.inc({ success: 'false' });
    httpErrorTotal.inc({ method: req.method, route: '/users/login', status_code: 400 });
    console.error(`[${new Date().toISOString()}] Email and password required for login`);
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const user = await trackDbQuery('user_findUnique', () => 
      prisma.user.findUnique({ where: { email } })
    );
    if (!user) {
      loginAttemptsTotal.inc({ success: 'false' });
      console.error(`[${new Date().toISOString()}] No user found with email`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      loginAttemptsTotal.inc({ success: 'false' });
      httpErrorTotal.inc({ method: req.method, route: '/users/login', status_code: 400 });
      console.error(`[${new Date().toISOString()}] Login failed for user - invalid password`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    loginAttemptsTotal.inc({ success: 'true' });

    res.json({ token });
  } catch (error) {
    loginAttemptsTotal.inc({ success: 'false' });
    next(error);
  }
});

router.get('/validate', authenticateToken, async (req: AuthRequest, res, next) => {
  if (!req.user) {
    httpErrorTotal.inc({ method: req.method, route: '/users/validate', status_code: 401 });
    console.error(`[${new Date().toISOString()}] Unauthorized access attempt to /users/validate`);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await trackDbQuery('user_findUnique', () => 
      prisma.user.findUnique({ where: { id: req.user!.id } })
    );
    if (!user) {
      httpErrorTotal.inc({ method: req.method, route: '/users/validate', status_code: 401 });
      console.error(`[${new Date().toISOString()}] User not found during token validation`);
      return res.status(401).json({ message: 'User not found' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
});

export default router;