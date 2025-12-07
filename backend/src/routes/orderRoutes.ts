import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

// Import metrics
import { ordersTotal, trackDbQuery } from '../monitoring';

const router = Router();

router.post('/', async (req: AuthRequest, res: Response) => {
  const { items } = req.body;

  if (!req.user || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  if (items.some((item: any) => !item.productId || !item.quantity)) {
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

    // Track successful order creation
    ordersTotal.inc();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: `Internal server error ${error}` });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
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
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;