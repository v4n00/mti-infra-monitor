import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

// Import metrics
import { httpErrorTotal, trackDbQuery } from '../monitoring';

const router = Router();

router.post('/', async (req: AuthRequest, res: Response, next) => {
  const { items } = req.body;

  if (!req.user || !items || !Array.isArray(items)) {
    httpErrorTotal.inc({ method: req.method, route: '/orders', status_code: 400 });
    console.error(`[${new Date().toISOString()}] Invalid order creation request`);
    return res.status(400).json({ message: 'Invalid request' });
  }

  if (items.some((item: any) => !item.productId || !item.quantity)) {
    httpErrorTotal.inc({ method: req.method, route: '/orders', status_code: 400 });
    console.error(`[${new Date().toISOString()}] Each item must have productId and quantity`);
    return res.status(400).json({ message: 'Each item must have productId and quantity' });
  }

  try {
    const order = await trackDbQuery('order_create', () => 
      prisma.order.create({
        data: {
          userId: req.user!.id,
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId as number,
              quantity: item.quantity as number,
            })),
          },
        },
        include: { orderItems: { include: { product: true } } },
      })
    );

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: AuthRequest, res: Response, next) => {
  if (!req.user) {
    httpErrorTotal.inc({ method: req.method, route: '/orders', status_code: 401 });
    console.error(`[${new Date().toISOString()}] Unauthorized access attempt to /orders`);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const orders = await trackDbQuery('order_findMany', () => 
      prisma.order.findMany({
        where: { userId: req.user!.id },
        include: { orderItems: { include: { product: true } } },
      })
    );
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

export default router;