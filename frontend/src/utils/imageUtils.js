/**
 * Utility function to get the correct image source
 * Handles base64 (old format), local paths, and Cloudinary URLs (new format)
 */
export const getImageSrc = (image) => {
  if (!image) return "";
  
  // Convert to string and trim whitespace
  const imgStr = String(image).trim();
  
  if (!imgStr) return "";
  
  // If it's already a data URL (base64), return as is
  if (imgStr.startsWith('data:image/') || imgStr.startsWith('data:')) {
    return imgStr;
  }
  
  // If it's a Cloudinary URL (http/https), return as is
  // Check this BEFORE checking for base64 to avoid prefixing URLs
  if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) {
    return imgStr;
  }
  
  // If it's a URL path starting with /uploads, return as is
  if (imgStr.startsWith('/uploads/')) {
    return imgStr;
  }
  
  // If it's a base64 string without data URL prefix, add it
  // Only do this if it's a long string and doesn't look like a URL
  if (typeof image === 'string' && imgStr.length > 100 && !imgStr.includes('://')) {
    // Likely base64, add data URL prefix
    return `data:image/jpeg;base64,${imgStr}`;
  }
  
  return imgStr;
};


