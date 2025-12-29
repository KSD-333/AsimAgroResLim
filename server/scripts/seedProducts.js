const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  {
    name: 'ASIM Super NPK',
    category: 'Macronutrient',
    description: 'ASIM Super NPK is a premium balanced fertilizer providing essential macronutrients for all-round crop development. It ensures robust stem and root growth, improved flowering, and higher crop yields. Ideal for most field crops including wheat, rice, maize, and vegetables.',
    shortDescription: 'Balanced NPK formula for optimal crop growth and yield.',
    imageUrl: 'https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 1200,
    sizes: ['1kg', '5kg', '10kg', '25kg'],
    nutrients: {
      nitrogen: 15,
      phosphorus: 15,
      potassium: 15
    },
    applicationMethod: 'Apply 2-3 kg per acre directly to soil before sowing or as top dressing.',
    benefits: ['Balanced nutrition for all growth stages', 'Improved root and shoot development', 'Enhanced flowering and fruiting', 'Higher yield potential'],
    stockAvailability: true,
    stockQuantity: 500,
    isFeatured: true,
    sku: 'ASIM-NPK-001'
  },
  {
    name: 'ASIM Nitrogen Plus',
    category: 'Macronutrient',
    description: 'ASIM Nitrogen Plus is a high-nitrogen fertilizer designed to boost vegetative growth and leaf development. With enhanced nitrogen efficiency, it provides sustained release for longer availability to plants. Perfect for leafy vegetables, cereal crops, and during early growth stages.',
    shortDescription: 'High-nitrogen formula for lush vegetative growth.',
    imageUrl: 'https://images.pexels.com/photos/2286895/pexels-photo-2286895.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 950,
    sizes: ['1kg', '5kg', '10kg', '25kg'],
    nutrients: {
      nitrogen: 46,
      phosphorus: 0,
      potassium: 0
    },
    applicationMethod: 'Apply 1-2 kg per acre as top dressing during vegetative growth phase.',
    benefits: ['Rapid green-up of crops', 'Enhanced leaf development', 'Increased protein content in grains', 'Improved overall growth'],
    stockAvailability: true,
    stockQuantity: 300,
    isFeatured: true,
    sku: 'ASIM-N-002'
  },
  {
    name: 'ASIM Phosphate Gold',
    category: 'Macronutrient',
    description: 'ASIM Phosphate Gold is a high-phosphorus fertilizer that promotes strong root systems and early plant establishment. It enhances energy transfer within plants, improving flowering, fruiting, and seed production. Essential for root crops and during flowering stages.',
    shortDescription: 'High-phosphorus fertilizer for robust root development.',
    imageUrl: 'https://images.pexels.com/photos/175389/pexels-photo-175389.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 1100,
    sizes: ['1kg', '5kg', '10kg', '25kg'],
    nutrients: {
      nitrogen: 0,
      phosphorus: 32,
      potassium: 0
    },
    applicationMethod: 'Apply 1.5-2 kg per acre at sowing or transplanting.',
    benefits: ['Strong root development', 'Enhanced flowering and fruiting', 'Improved seed production', 'Better stress tolerance'],
    stockAvailability: true,
    stockQuantity: 250,
    isFeatured: true,
    sku: 'ASIM-P-003'
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asim-agro');
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const createdProducts = [];
    for (const product of products) {
      const created = await Product.create(product);
      createdProducts.push(created);
    }
    console.log(`✅ Seeded ${createdProducts.length} products`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
