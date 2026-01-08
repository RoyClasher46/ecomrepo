# Debugging Cloudinary Image Issues

## Check Cloudinary URL Format

When images are uploaded via multer-storage-cloudinary, the file object contains:
- `path` - The secure URL (HTTPS)
- `url` - The regular URL
- `secure_url` - The secure URL (same as path usually)
- `public_id` - The public ID in Cloudinary

## Verify Image URLs in Database

Check your database to see what format the image URLs are stored in:
- Should be: `https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/ecommerce/products/filename.jpg`
- NOT: `/uploads/products/filename.jpg` (old format)

## Test Image Display

1. Check browser console for any errors
2. Verify the image URL is accessible by opening it directly in browser
3. Check Network tab to see if image request is being made

## Common Issues

### Images not showing
- Verify Cloudinary credentials in `.env`
- Check if image was actually uploaded to Cloudinary (check dashboard)
- Verify URL format in database matches Cloudinary URL format

### CORS errors
- Cloudinary URLs should work without CORS issues
- If you see CORS errors, check Cloudinary settings

### 404 errors
- Image might not have been uploaded successfully
- Check Cloudinary dashboard to verify image exists
- Verify public_id matches the URL

