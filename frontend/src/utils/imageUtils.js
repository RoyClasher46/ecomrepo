/**
 * Utility function to get the correct image source
 * Handles both base64 (old format) and URL paths (new format)
 */
export const getImageSrc = (image) => {
  if (!image) return "";
  
  // If it's already a data URL (base64), return as is
  if (image.startsWith('data:image/')) {
    return image;
  }
  
  // If it's a URL path starting with /uploads, add the backend URL in production
  if (image.startsWith('/uploads/')) {
    // In development, proxy handles this, so return as is
    // In production, you might need to prepend your backend URL
    return image;
  }
  
  // If it's a base64 string without data URL prefix, add it
  if (typeof image === 'string' && image.length > 100) {
    // Likely base64, add data URL prefix
    return `data:image/jpeg;base64,${image}`;
  }
  
  return image;
};

