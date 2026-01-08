# Import Sample Data

This guide will help you import sample data into your MongoDB database.

## Files Included

1. **`products-sample-data.json`** - Contains detailed product data only
2. **`import-products.js`** - Node.js script to import products (recommended if you already have users)
3. **`sample-data.json`** - Contains full sample data (products, users, orders)
4. **`import-sample-data.js`** - Node.js script to import all data

## Quick Start

### Option 1: Import Products Only (Recommended if you have users)

1. Make sure your `.env` file has the `MONGO_URI` configured:
   ```
   MONGO_URI=mongodb://localhost:27017/your-database-name
   ```

2. Run the products import script:
   ```bash
   # Import products without images
   node backend/import-products.js
   
   # Import products with images (if you have images in frontend/src/assets/products/)
   node backend/import-products.js --with-images
   ```

The script will:
- Connect to your MongoDB database
- Clear existing products (optional - you can modify the script to keep existing products)
- Import detailed product data including prices, descriptions, sizes, reviews, and upload dates
- Optionally include images from your assets folder

### Option 2: Import All Data (Products, Users, Orders)

1. Make sure your `.env` file has the `MONGO_URI` configured

2. Run the full import script:
   ```bash
   node backend/import-sample-data.js
   ```

The script will:
- Connect to your MongoDB database
- Clear existing data (optional - you can modify the script to keep existing data)
- Import products, users, and orders
- Link orders to users

## Sample Data Included

### Products (10 items with detailed information)
- **Wireless Bluetooth Headphones** - ₹2,999 (15% off) - Electronics
- **Running Sports Shoes** - ₹4,499 (20% off) - Footwear
- **Smart Watch Pro** - ₹8,999 (10% off) - Electronics
- **Premium Cotton T-Shirt** - ₹799 - Clothing
- **Genuine Leather Wallet** - ₹1,299 (5% off) - Accessories
- **Laptop Backpack** - ₹2,499 (12% off) - Accessories
- **Wireless Optical Mouse** - ₹899 - Electronics
- **Classic Fit Denim Jeans** - ₹1,999 (25% off) - Clothing
- **Wireless Earbuds** - ₹3,499 (18% off) - Electronics
- **Casual Sneakers** - ₹2,299 (15% off) - Footwear

Each product includes:
- Detailed descriptions
- Multiple sizes with availability
- Customer reviews with ratings
- Upload dates (createdAt)
- Category classification
- Popularity flags
- Discount percentages

### Users (3 accounts)
- John Doe (regular user)
- Jane Smith (regular user)
- Admin User (admin account)

### Orders (3 sample orders)
- Various order statuses (Pending, Accepted, Delivered)
- Different payment methods
- Sample delivery information

## Important Notes

1. **Product Images**: The sample data does NOT include product images (since they're stored as Buffers). You'll need to add images through your admin panel after importing.

2. **User Passwords**: The passwords in the sample data are placeholder hashes. You should:
   - Use your actual password hashing mechanism
   - Or create new users through your registration system
   - Or manually update passwords after import

3. **Object IDs**: The sample data uses specific ObjectIds to maintain relationships between collections. If you modify the data, ensure ObjectIds remain consistent.

## Customizing the Data

You can edit `sample-data.json` to:
- Add more products
- Modify product details
- Add more users
- Create additional orders
- Change categories, prices, etc.

After editing, run the import script again (it will clear existing data by default).

## Troubleshooting

### Connection Error
- Check your `MONGO_URI` in `.env` file
- Ensure MongoDB is running
- Verify database credentials

### Import Errors
- Check MongoDB logs for specific error messages
- Ensure all required fields are present in the JSON
- Verify ObjectId format is correct

### Missing Images
- This is expected - images must be added separately
- Use the admin panel to upload product images
- Or modify the import script to include image files

## Next Steps

After importing:
1. Log in to the admin panel
2. Upload product images for each product
3. Test the application with the sample data
4. Create additional products/users as needed

