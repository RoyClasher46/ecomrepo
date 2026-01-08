# Quick Deployment Checklist

## Backend (Render) - 5 Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Create Web Service on Render**
   - Go to https://dashboard.render.com
   - New → Web Service → Connect GitHub
   - Select repository

3. **Configure Service**
   - Name: `ecommerce-backend`
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`

4. **Add Environment Variables** (in Render dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your-mongodb-atlas-url
   JWT_SECRET=your-secret
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   FRONTEND_URL=https://your-app.netlify.app
   ```

5. **Deploy & Copy URL**
   - Click "Create Web Service"
   - Copy URL: `https://your-app.onrender.com`

## Frontend (Netlify) - 5 Steps

1. **Update API Config** (optional - can use env var)
   - Edit `frontend/src/config/api.js`
   - Replace `your-backend-app.onrender.com` with your Render URL

2. **Create Netlify Site**
   - Go to https://app.netlify.com
   - New site from Git → Connect GitHub

3. **Configure Build**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish: `frontend/build`

4. **Add Environment Variable**
   - Site settings → Environment variables
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend.onrender.com`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

## After Deployment

1. **Update Backend CORS**
   - In Render, update `FRONTEND_URL` with your Netlify URL
   - Redeploy backend

2. **Test**
   - Visit your Netlify URL
   - Test login, signup, and API calls

## Important URLs to Save

- Backend: `https://your-app.onrender.com`
- Frontend: `https://your-app.netlify.app`
- MongoDB Atlas: Your connection string
- Cloudinary: Your dashboard URL
