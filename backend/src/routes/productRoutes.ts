import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: category ? { category: (category as string).toLowerCase() } : {},
      include: { images: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(error);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: true },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;