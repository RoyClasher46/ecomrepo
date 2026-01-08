/**
 * Import Products Only - Sample Data
 * 
 * This script imports only product data into your MongoDB database.
 * 
 * Usage:
 *   1. Make sure your MongoDB connection string is set in .env file (MONGO_URI)
 *   2. Run: node backend/import-products.js
 *   3. Optional: Use --with-images flag to include images from assets folder
 *      Example: node backend/import-products.js --with-images
 * 
 * Note: Images are stored as Buffers in MongoDB. If you use --with-images flag,
 * the script will try to load images from frontend/src/assets/products/ folder.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Product model
const Product = require('./models/product-model');

// Check if --with-images flag is provided
const includeImages = process.argv.includes('--with-images');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ MongoDB Connected\n');
    } catch (err) {
        console.error('✗ DB Connection Error:', err);
        process.exit(1);
    }
};

// Function to load image as Buffer
const loadImage = (imagePath) => {
    try {
        if (fs.existsSync(imagePath)) {
            return fs.readFileSync(imagePath);
        }
        return null;
    } catch (error) {
        console.warn(`⚠ Warning: Could not load image from ${imagePath}`);
        return null;
    }
};

// Import products function
const importProducts = async () => {
    try {
        // Read sample data file
        const dataPath = path.join(__dirname, 'products-sample-data.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);

        console.log('📦 Starting product import...\n');

        // Clear existing products (optional - comment out if you want to keep existing products)
        console.log('🗑️  Clearing existing products...');
        await Product.deleteMany({});
        console.log('✓ Existing products cleared\n');

        // Image mapping (maps product names to image files in assets folder)
        const imageMap = {
            'Wireless Bluetooth Headphones': 'headphone.jpg',
            'Running Sports Shoes': 'shoes.jpg',
            'Smart Watch Pro': 'watch.jpg'
        };

        // Import Products
        console.log('📱 Importing products...\n');
        const products = [];

        for (const product of data.products) {
            const productData = {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                isPopular: product.isPopular,
                discount: product.discount,
                sizes: product.sizes,
                reviews: product.reviews.map(review => ({
                    user: review.user,
                    rating: review.rating,
                    comment: review.comment,
                    reviewImages: review.reviewImages || [],
                    createdAt: new Date(review.createdAt)
                })),
                createdAt: new Date(product.createdAt)
            };

            // Add images if --with-images flag is used
            if (includeImages) {
                const imageFileName = imageMap[product.name];
                if (imageFileName) {
                    const imagePath = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'products', imageFileName);
                    const imageBuffer = loadImage(imagePath);
                    if (imageBuffer) {
                        productData.image = imageBuffer;
                        productData.images = [imageBuffer]; // Using same image for both main and additional
                        console.log(`  ✓ Loaded image for: ${product.name}`);
                    } else {
                        console.log(`  ⚠ No image found for: ${product.name}`);
                    }
                } else {
                    console.log(`  ⚠ No image mapping for: ${product.name}`);
                }
            }

            products.push(productData);
        }

        // Insert all products
        await Product.insertMany(products);

        console.log(`\n✅ Successfully imported ${products.length} products!\n`);

        // Display summary
        console.log('📊 Import Summary:');
        console.log(`   Total Products: ${products.length}`);
        const withImages = products.filter(p => p.image).length;
        const withoutImages = products.length - withImages;
        console.log(`   Products with images: ${withImages}`);
        console.log(`   Products without images: ${withoutImages}`);
        
        if (withoutImages > 0 && !includeImages) {
            console.log('\n💡 Tip: Run with --with-images flag to include product images');
            console.log('   Example: node backend/import-products.js --with-images\n');
        }

        // Display product details
        console.log('\n📋 Imported Products:');
        products.forEach((product, index) => {
            const discountPrice = product.price - (product.price * product.discount / 100);
            console.log(`\n   ${index + 1}. ${product.name}`);
            console.log(`      Category: ${product.category}`);
            console.log(`      Price: ₹${product.price} ${product.discount > 0 ? `(₹${discountPrice.toFixed(2)} after ${product.discount}% discount)` : ''}`);
            console.log(`      Popular: ${product.isPopular ? 'Yes' : 'No'}`);
            console.log(`      Sizes: ${product.sizes.map(s => s.size).join(', ')}`);
            console.log(`      Reviews: ${product.reviews.length}`);
            console.log(`      Upload Date: ${new Date(product.createdAt).toLocaleString()}`);
            console.log(`      Image: ${product.image ? '✓ Included' : '✗ Not included'}`);
        });

        console.log('\n✅ Product import completed successfully!\n');

    } catch (error) {
        console.error('✗ Error importing products:', error);
    } finally {
        mongoose.connection.close();
        console.log('✓ Database connection closed');
    }
};

// Run import
const run = async () => {
    await connectDB();
    await importProducts();
};

run();


