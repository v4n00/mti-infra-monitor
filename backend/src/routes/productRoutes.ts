import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

// Import metrics
import { trackDbQuery } from '../monitoring';

const router = Router();

router.get('/', async (req: Request, res: Response, next) => {
  const { category } = req.query;

  try {
    const products = await trackDbQuery('product_findMany', () => 
      prisma.product.findMany({
        where: category ? { category: (category as string).toLowerCase() } : {},
        include: { images: true },
      })
    );

    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next) => {
  const { id } = req.params;
  try {
    const product = await trackDbQuery('product_findUnique', () => 
      prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { images: true },
      })
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

export default router;