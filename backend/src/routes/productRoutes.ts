import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/', async (req: Request, res: Response) => {
  const { category } = req.query;
  try {
    const products = await prisma.product.findMany({
      where: category ? { category: category as string } : {},
      include: { images: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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

router.post('/', requireAdmin, upload.array('images'), async (req: AuthRequest, res: Response) => {
  const { name, description, price, category } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!name || !description || !price) {
    return res.status(400).json({ message: 'Name, description, and price required' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
      },
    });

    if (files) {
      for (const file of files) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            filename: file.filename,
            filepath: file.path,
          },
        });
      }
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;