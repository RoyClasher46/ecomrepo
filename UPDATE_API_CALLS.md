# Updating API Calls for Production

## Current Status

Your codebase uses relative paths for API calls (e.g., `/api/login`). These work in development with the proxy, but need to be updated for production.

## Option 1: Quick Fix (Recommended for Quick Deployment)

Update your `frontend/src/config/api.js` to automatically handle relative paths:

The current config already handles this! Just make sure to:

1. Set `REACT_APP_API_URL` in Netlify environment variables
2. The existing relative paths will work because the config handles them

## Option 2: Update Fetch Calls (Better Long-term)

You can optionally update fetch calls to use the `getApiUrl` helper for more control.

### Example Update:

**Before:**
```javascript
fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
  credentials: "include",
})
```

**After:**
```javascript
import { getApiUrl } from '../config/api';

fetch(getApiUrl("/api/login"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
  credentials: "include",
})
```

### Files That Need Updates (Optional):

- `frontend/src/components/login.jsx`
- `frontend/src/components/signup.jsx`
- `frontend/src/components/home.jsx`
- `frontend/src/components/main.jsx`
- `frontend/src/components/category.jsx`
- `frontend/src/components/selectedprod.jsx`
- `frontend/src/components/navbar.jsx`
- `frontend/src/components/profile.jsx`
- `frontend/src/components/checkout.jsx`
- `frontend/src/components/usercart.jsx`
- `frontend/src/components/myorder.jsx`
- `frontend/src/components/forgotpassword.jsx`
- `frontend/src/components/adminlogin.jsx`
- `frontend/src/admin/components/*.jsx`
- And any other files making API calls

## Option 3: Use API Utility (Best Practice)

Use the provided API utility functions:

```javascript
import { apiPost, apiGet } from '../utils/api';

// Instead of:
fetch("/api/login", { method: "POST", ... })

// Use:
const response = await apiPost("/api/login", formData, {
  credentials: "include"
});
const data = await response.json();
```

## Recommendation

For **quick deployment**, the current setup will work if you:
1. Set `REACT_APP_API_URL` in Netlify
2. The config automatically handles relative paths

For **better maintainability**, gradually update files to use `getApiUrl()` or the API utility functions.
