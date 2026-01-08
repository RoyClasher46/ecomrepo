/**
 * MongoDB Sample Data Import Script
 * 
 * This script imports sample data into your MongoDB database.
 * 
 * Usage:
 *   1. Make sure your MongoDB connection string is set in .env file (MONGO_URI)
 *   2. Run: node backend/import-sample-data.js
 * 
 * Note: This script will:
 *   - Import products, users, and orders
 *   - Skip image fields (Buffers cannot be stored in JSON)
 *   - You can add product images later through your admin panel
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Product = require('./models/product-model');
const User = require('./models/user-model');
const Order = require('./models/order-model');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ MongoDB Connected');
    } catch (err) {
        console.error('✗ DB Connection Error:', err);
        process.exit(1);
    }
};

// Import data function
const importData = async () => {
    try {
        // Read sample data file
        const dataPath = path.join(__dirname, 'sample-data.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);

        console.log('\n📦 Starting data import...\n');

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});
        console.log('✓ Existing data cleared\n');

        // Import Products
        console.log('📱 Importing products...');
        const products = data.products.map(product => {
            // Convert MongoDB extended JSON format to regular objects
            const productData = {
                _id: new mongoose.Types.ObjectId(product._id.$oid),
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
                    createdAt: new Date(review.createdAt.$date)
                })),
                createdAt: new Date(product.createdAt.$date)
            };
            return productData;
        });
        await Product.insertMany(products);
        console.log(`✓ Imported ${products.length} products\n`);

        // Import Users
        console.log('👥 Importing users...');
        const users = data.users.map(user => ({
            _id: new mongoose.Types.ObjectId(user._id.$oid),
            name: user.name,
            email: user.email,
            password: user.password, // Note: In production, use proper hashed passwords
            picture: user.picture || '',
            isAdmin: user.isAdmin,
            mobile: user.mobile || '',
            homeAddress: user.homeAddress,
            workAddress: user.workAddress,
            cart: [],
            orders: []
        }));
        await User.insertMany(users);
        console.log(`✓ Imported ${users.length} users\n`);

        // Import Orders
        console.log('📦 Importing orders...');
        const orders = data.orders.map(order => ({
            _id: new mongoose.Types.ObjectId(order._id.$oid),
            productId: new mongoose.Types.ObjectId(order.productId.$oid),
            userId: new mongoose.Types.ObjectId(order.userId.$oid),
            quantity: order.quantity,
            size: order.size || '',
            status: order.status,
            addressLine: order.addressLine || '',
            area: order.area || '',
            city: order.city || '',
            state: order.state || '',
            pincode: order.pincode || '',
            deliveryAddress: order.deliveryAddress || '',
            deliveryPhone: order.deliveryPhone || '',
            deliveryPartnerName: order.deliveryPartnerName || '',
            deliveryPartnerPhone: order.deliveryPartnerPhone || '',
            trackingId: order.trackingId || '',
            estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery.$date) : null,
            deliveredDate: order.deliveredDate ? new Date(order.deliveredDate.$date) : null,
            returnStatus: order.returnStatus || 'None',
            returnReason: order.returnReason || '',
            returnRequestDate: order.returnRequestDate ? new Date(order.returnRequestDate.$date) : null,
            returnApprovedDate: order.returnApprovedDate ? new Date(order.returnApprovedDate.$date) : null,
            paymentType: order.paymentType || 'Cash on Delivery',
            paymentMethod: order.paymentMethod || 'Cash',
            paymentStatus: order.paymentStatus || 'Pending',
            paymentId: order.paymentId || '',
            paymentVerified: order.paymentVerified || false,
            paymentVerifiedAt: order.paymentVerifiedAt ? new Date(order.paymentVerifiedAt.$date) : null,
            paymentAmount: order.paymentAmount || 0,
            createdAt: new Date(order.createdAt.$date)
        }));
        await Order.insertMany(orders);
        console.log(`✓ Imported ${orders.length} orders\n`);

        // Update user orders array
        console.log('🔗 Linking orders to users...');
        for (const order of orders) {
            await User.findByIdAndUpdate(
                order.userId,
                { $push: { orders: order._id } }
            );
        }
        console.log('✓ Orders linked to users\n');

        console.log('✅ Data import completed successfully!\n');
        console.log('📝 Note: Product images are not included in the sample data.');
        console.log('   You can add images through your admin panel after logging in.\n');
        console.log('🔑 Test Credentials:');
        console.log('   Admin: admin@example.com');
        console.log('   User: john.doe@example.com / jane.smith@example.com');
        console.log('   Password: (use your actual password hashing - these are placeholders)\n');

    } catch (error) {
        console.error('✗ Error importing data:', error);
    } finally {
        mongoose.connection.close();
        console.log('✓ Database connection closed');
    }
};

// Run import
const run = async () => {
    await connectDB();
    await importData();
};

run();

