# Environment Variables Setup Guide

After switching to MongoDB Atlas, make sure your `backend/.env` file contains ALL required variables.

## Required Environment Variables

Your `backend/.env` file should include:

```env
# ============================================
# MongoDB Configuration (MongoDB Atlas)
# ============================================
# Get your connection string from MongoDB Atlas Dashboard
# Format: mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority

# ============================================
# JWT Secret Key
# ============================================
# Use a long, random string for production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ============================================
# Email Configuration (REQUIRED)
# ============================================
# For Gmail, you MUST use an App Password (not your regular password)
# 
# Steps to get Gmail App Password:
# 1. Go to https://myaccount.google.com/security
# 2. Enable 2-Step Verification (if not already enabled)
# 3. Go to https://myaccount.google.com/apppasswords
# 4. Select "Mail" and "Other (Custom name)"
# 5. Enter "E-commerce App" and click Generate
# 6. Copy the 16-character password (remove spaces)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop

# ============================================
# Cloudinary Configuration (for image storage)
# ============================================
# Get these from https://cloudinary.com dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# Server Configuration
# ============================================
PORT=5000
NODE_ENV=development
```

## Quick Checklist

After updating your `.env` file, verify you have:

- ✅ `MONGO_URI` - Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` - A secret key for JWT tokens
- ✅ `EMAIL_SERVICE` - Email service (usually "gmail")
- ✅ `EMAIL_USER` - Your Gmail address
- ✅ `EMAIL_PASSWORD` - Your Gmail App Password (16 characters, no spaces)
- ✅ `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- ✅ `CLOUDINARY_API_KEY` - Your Cloudinary API key
- ✅ `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- ✅ `PORT` - Server port (default: 5000)

## Important Notes

1. **No Quotes**: Don't use quotes around values in .env file
   ```
   ❌ Wrong: EMAIL_USER="your-email@gmail.com"
   ✅ Correct: EMAIL_USER=your-email@gmail.com
   ```

2. **No Spaces**: Remove all spaces from App Password
   ```
   ❌ Wrong: EMAIL_PASSWORD=abcd efgh ijkl mnop
   ✅ Correct: EMAIL_PASSWORD=abcdefghijklmnop
   ```

3. **Restart Server**: After updating .env, restart your server
   ```bash
   # Stop server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Testing Your Configuration

1. **Test Email Configuration:**
   ```bash
   curl http://localhost:5000/api/check-email-config
   ```

2. **Test MongoDB Connection:**
   - Check server logs when starting - should see "MongoDB Connected"

3. **Test Cloudinary:**
   - Try uploading a product image through admin panel

## Troubleshooting

### Error: "Email service not configured"
- Make sure `EMAIL_USER` and `EMAIL_PASSWORD` are in your `.env` file
- Check there are no typos in variable names
- Restart your server after adding them

### Error: "MongoDB connection failed"
- Verify your `MONGO_URI` is correct
- Make sure your MongoDB Atlas IP whitelist includes your current IP (or 0.0.0.0/0 for all)
- Check username and password in connection string

### Error: "Cloudinary configuration error"
- Verify all three Cloudinary variables are set
- Check credentials in Cloudinary dashboard
