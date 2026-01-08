# Cloudinary Setup Guide

## Overview
All product images are now stored in Cloudinary instead of local file system. This provides:
- ✅ Unlimited storage
- ✅ CDN delivery (fast image loading)
- ✅ Automatic image optimization
- ✅ No local storage management needed

## Setup Instructions

### 1. Create Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. You'll get 25GB storage and 25GB bandwidth per month (free tier)

### 2. Get Your Credentials
After signing up, go to your Dashboard. You'll find:
- **Cloud Name**
- **API Key**
- **API Secret**

### 3. Add to .env File
Add these variables to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Image Storage
- Images are stored in folder: `ecommerce/products/`
- Images are automatically optimized (quality, format, size)
- Maximum file size: 5MB
- Supported formats: JPG, JPEG, PNG, GIF, WEBP

## Migration Notes

### Old Products
- Products with Buffer images (base64) will continue to work
- Products with local file paths (`/uploads/products/...`) will need to be re-uploaded
- New uploads automatically go to Cloudinary

### Image URLs
- Cloudinary URLs look like: `https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/ecommerce/products/filename.jpg`
- These URLs are stored directly in the database
- Frontend automatically handles Cloudinary URLs (they're just HTTP URLs)

## Troubleshooting

### Images not uploading?
1. Check your `.env` file has correct Cloudinary credentials
2. Verify credentials in Cloudinary dashboard
3. Check file size (max 5MB)
4. Check file format (only images allowed)

### Images not displaying?
- Cloudinary URLs are HTTP/HTTPS URLs, so they should work directly
- Check browser console for any CORS or loading errors
- Verify the URL is accessible in browser

### Need to migrate old images?
1. Export products with local file paths
2. Upload images to Cloudinary manually or via script
3. Update database with Cloudinary URLs

