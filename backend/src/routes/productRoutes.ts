import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

// Import metrics
import { productsViewedTotal, trackDbQuery } from '../monitoring';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category } = req.query;

  try {
    const products = await trackDbQuery('product_findMany', () => 
      prisma.product.findMany({
        where: category ? { category: (category as string).toLowerCase() } : {},
        include: { images: true },
      })
    );

    // Track product views (count all products returned)
    productsViewedTotal.inc(products.length);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(error);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
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

    // Track individual product view
    productsViewedTotal.inc();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;