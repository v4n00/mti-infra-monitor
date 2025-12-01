import prisma from '../src/config/prisma'
import bcrypt from 'bcrypt';

async function main() {
  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      password: hashedPassword,
    },
  });

  // Create products
  const product1 = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Laptop',
      description: 'A powerful laptop for work and gaming',
      price: 999.99,
      category: 'electronics',
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Book',
      description: 'An interesting novel',
      price: 19.99,
      category: 'books',
    },
  });

  const product3 = await prisma.product.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Headphones',
      description: 'Noise-cancelling wireless headphones',
      price: 199.99,
      category: 'electronics',
    },
  });

  // Create product images (assuming files exist in uploads/)
  await prisma.productImage.upsert({
    where: { id: 1 },
    update: {},
    create: {
      productId: product1.id,
      filename: 'laptop.jpg',
      filepath: 'uploads/laptop.jpg',
    },
  });

  await prisma.productImage.upsert({
    where: { id: 2 },
    update: {},
    create: {
      productId: product2.id,
      filename: 'book.jpg',
      filepath: 'uploads/book.jpg',
    },
  });

  // Create an order
  const order = await prisma.order.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user1.id,
    },
  });

  // Create order items
  await prisma.orderItem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      orderId: order.id,
      productId: product1.id,
      quantity: 1,
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 2 },
    update: {},
    create: {
      orderId: order.id,
      productId: product2.id,
      quantity: 2,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
