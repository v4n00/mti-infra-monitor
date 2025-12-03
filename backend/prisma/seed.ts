import prisma from '../src/config/prisma'
import bcrypt from 'bcrypt';

async function main() {
  await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const products = [
    { id: 1, name: 'Laptop', description: 'A powerful laptop for work and gaming', price: 999.99, category: 'Electronics' },
    { id: 2, name: 'VR Headset', description: 'Virtual reality headset for gaming', price: 399.99, category: 'Electronics' },
    { id: 3, name: 'Headphones', description: 'Noise-cancelling wireless headphones', price: 199.99, category: 'Electronics' },
    { id: 4, name: 'Gaming Laptop', description: 'High-performance gaming laptop', price: 1499.99, category: 'Electronics' },
    { id: 5, name: 'Smartphone', description: 'Latest smartphone with advanced features', price: 699.99, category: 'Electronics' },
    { id: 6, name: 'Tablet', description: 'Portable tablet for work and entertainment', price: 399.99, category: 'Electronics' },
    { id: 7, name: 'Wireless Earbuds', description: 'True wireless earbuds with great sound', price: 149.99, category: 'Electronics' },
    { id: 8, name: 'Smart Watch', description: 'Fitness and health tracking smartwatch', price: 299.99, category: 'Electronics' },
    { id: 9, name: 'Desktop Computer', description: 'Powerful desktop PC for home office', price: 899.99, category: 'Electronics' },
    { id: 10, name: 'Monitor', description: '4K UHD monitor for crisp visuals', price: 349.99, category: 'Electronics' },
    { id: 11, name: 'Keyboard', description: 'Mechanical gaming keyboard', price: 129.99, category: 'Electronics' },
    { id: 12, name: 'Mouse', description: 'Wireless ergonomic mouse', price: 49.99, category: 'Electronics' },
    { id: 13, name: 'Router', description: 'High-speed WiFi router', price: 79.99, category: 'Electronics' },
    { id: 14, name: 'External Hard Drive', description: '1TB portable hard drive', price: 89.99, category: 'Electronics' },
    { id: 15, name: 'Webcam', description: 'HD webcam for video calls', price: 59.99, category: 'Electronics' },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: prod,
    });
  }

  const images = [
    { id: 1, productId: 1, filename: 'laptop.webp' },
    { id: 2, productId: 2, filename: 'vr-headset.webp' },
    { id: 3, productId: 3, filename: 'headphones.webp' },
    { id: 4, productId: 4, filename: 'gaming-laptop.webp' },
    { id: 5, productId: 5, filename: 'smartphone.webp' },
    { id: 6, productId: 6, filename: 'tablet.webp' },
    { id: 7, productId: 7, filename: 'earbuds.webp' },
    { id: 8, productId: 8, filename: 'smart-watch.webp' },
    { id: 9, productId: 9, filename: 'desktop.webp' },
    { id: 10, productId: 10, filename: 'monitor.webp' },
    { id: 11, productId: 11, filename: 'keyboard.webp' },
    { id: 12, productId: 12, filename: 'mouse.webp' },
    { id: 13, productId: 13, filename: 'router.webp' },
    { id: 14, productId: 14, filename: 'hard-drive.webp' },
    { id: 15, productId: 15, filename: 'webcam.webp' }
  ];

  for (const img of images) {
    await prisma.productImage.upsert({
      where: { id: img.id },
      update: {},
      create: {
        productId: img.productId,
        filename: img.filename,
      },
    });
  }
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
