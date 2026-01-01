const mongoose = require("mongoose");
const path = require("path");
const productModel = require("./models/product-model");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const PLACEHOLDER_JPEG_BASE64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAFf/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9k=";

const placeholderImage = Buffer.from(PLACEHOLDER_JPEG_BASE64, "base64");

const sampleProducts = [
  { name: "Wireless Bluetooth Headphones", description: "Noise-cancelling wireless headphones with 30-hour battery life.", price: 89.99, category: "Electronics", isPopular: true, discount: 15 },
  { name: "Smart Fitness Watch", description: "Track steps, heart rate, and workouts with built-in GPS.", price: 199.99, category: "Electronics", isPopular: true, discount: 10 },
  { name: "Organic Cotton T-Shirt", description: "Soft organic cotton t-shirt with a modern fit.", price: 24.99, category: "Fashion", isPopular: false, discount: 0 },
  { name: "Running Shoes", description: "Lightweight running shoes with responsive cushioning.", price: 79.99, category: "Sports", isPopular: true, discount: 30 },
  { name: "Stainless Steel Water Bottle", description: "Insulated bottle keeps drinks cold 24h / hot 12h.", price: 29.99, category: "Sports", isPopular: true, discount: 5 },
  { name: "LED Desk Lamp", description: "Adjustable LED lamp with brightness + temperature controls.", price: 44.99, category: "Home", isPopular: false, discount: 0 },
  { name: "Wireless Charging Pad", description: "Fast Qi wireless charger for compatible phones and earbuds.", price: 19.99, category: "Electronics", isPopular: true, discount: 25 },
  { name: "Coffee Maker", description: "Programmable coffee maker with auto shutoff.", price: 59.99, category: "Home", isPopular: false, discount: 15 },
  { name: "Laptop Backpack", description: "Durable backpack with padded laptop compartment.", price: 49.99, category: "Fashion", isPopular: false, discount: 10 },
  { name: "Laptop Stand", description: "Aluminum adjustable stand for better ergonomics.", price: 39.99, category: "Electronics", isPopular: false, discount: 20 },
  { name: "Bluetooth Speaker", description: "Portable waterproof speaker with 360-degree sound.", price: 54.99, category: "Electronics", isPopular: true, discount: 15 },
  { name: "Kitchen Knife Set", description: "Stainless steel knife set with wooden block.", price: 89.99, category: "Home", isPopular: false, discount: 25 },
  { name: "Yoga Mat", description: "Non-slip yoga mat with extra thickness.", price: 34.99, category: "Sports", isPopular: false, discount: 20 },
  { name: "Winter Jacket", description: "Warm waterproof jacket with removable hood.", price: 129.99, category: "Fashion", isPopular: true, discount: 35 },
  { name: "Resistance Bands Set", description: "Set of resistance bands for full-body workouts.", price: 24.99, category: "Sports", isPopular: false, discount: 30 }
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
  try {
    await mongoose.connect(mongoUri);
    await productModel.deleteMany({});

    const docs = sampleProducts.map((p) => ({ ...p, image: placeholderImage }));
    const inserted = await productModel.insertMany(docs);

    console.log(`Inserted ${inserted.length} products.`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
