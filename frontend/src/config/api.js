// API Configuration
// Automatically detects if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

// Backend API URL
// In development, use proxy (localhost:5000) - relative paths work
// In production, use your Render backend URL
export const API_BASE_URL = isDevelopment 
  ? '' // Use proxy in development (see package.json)
  : (process.env.REACT_APP_API_URL || 'https://ecommerce-lt30.onrender.com');

// Helper function to build API URLs
// Works with both relative paths (starting with /) and full URLs
export const getApiUrl = (endpoint) => {
  // If endpoint is already a full URL, return as is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // If in development or no API_BASE_URL, use relative path (works with proxy)
  if (!API_BASE_URL || isDevelopment) {
    return endpoint;
  }
  
  // In production, prepend API_BASE_URL
  // Remove leading slash from endpoint to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Ensure API_BASE_URL doesn't end with slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Override fetch to automatically use API_BASE_URL in production
// This makes existing code work without changes
if (!isDevelopment && API_BASE_URL && typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Only modify relative URLs that look like API calls
    if (typeof url === 'string' && 
        (url.startsWith('/api/') || url.startsWith('/products'))) {
      url = getApiUrl(url);
    }
    return originalFetch.call(this, url, options);
  };
}

export default API_BASE_URL;
