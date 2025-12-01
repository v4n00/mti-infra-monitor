import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

router.post('/', async (req: AuthRequest, res: Response) => {
  const { items } = req.body; // items: [{ productId, quantity }]

  if (!req.user || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { orderItems: { include: { product: true } } },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;