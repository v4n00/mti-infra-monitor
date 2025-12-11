import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { httpErrorTotal } from '../monitoring';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error(`[${new Date().toISOString()}] Access token required`);
    httpErrorTotal.inc({ method: req.method, route: req.path, status_code: 401 });
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Invalid token`);
      httpErrorTotal.inc({ method: req.method, route: req.path, status_code: 403 });
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user as { id: number; email: string };
    next();
  });
};