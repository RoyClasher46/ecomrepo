# Deployment Guide

This guide will help you deploy the frontend to Netlify and backend to Render.

## Prerequisites

1. GitHub account (or GitLab/Bitbucket)
2. Netlify account (free tier available)
3. Render account (free tier available)
4. MongoDB Atlas account (free tier available)
5. Cloudinary account (free tier available)

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Backend for Render

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy to Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Sign up or log in

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure the Service**
   - **Name**: `ecommerce-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if deploying from root)

4. **Set Environment Variables**
   Click "Environment" tab and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-secret-key
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=https://your-app-name.netlify.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your Render URL (e.g., `https://ecommerce-backend.onrender.com`)

### Step 3: Update Backend Package.json

Make sure your `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

## Part 2: Frontend Deployment (Netlify)

### Step 1: Update Frontend Configuration

1. **Create `.env.production` file** in `frontend` directory:
   ```env
   REACT_APP_API_URL=https://your-backend-app.onrender.com
   ```
   Replace `your-backend-app.onrender.com` with your actual Render URL.

2. **Build the frontend locally** (optional, to test):
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Sign up or log in

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect to Git provider (GitHub)
   - Select your repository

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-app.onrender.com
     ```
   - Replace with your actual Render backend URL

5. **Deploy**
   - Click "Deploy site"
   - Wait for deployment

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**:
   ```bash
   cd frontend
   netlify init
   netlify deploy --prod
   ```

### Step 3: Update CORS in Backend

After getting your Netlify URL, update the `FRONTEND_URL` environment variable in Render:
```
FRONTEND_URL=https://your-app-name.netlify.app
```

Then redeploy the backend service.

## Part 3: Post-Deployment Checklist

### Backend (Render)
- [ ] Backend is accessible at Render URL
- [ ] Environment variables are set correctly
- [ ] MongoDB Atlas connection is working
- [ ] CORS is configured to allow Netlify domain
- [ ] Email service is configured

### Frontend (Netlify)
- [ ] Frontend is accessible at Netlify URL
- [ ] `REACT_APP_API_URL` is set to Render backend URL
- [ ] All API calls are working
- [ ] Authentication is working
- [ ] Images are loading correctly

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `package.json` has correct start script

**Problem**: CORS errors
- Verify `FRONTEND_URL` is set correctly in Render
- Check that Netlify URL matches the allowed origin

**Problem**: Database connection failed
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for Render)

### Frontend Issues

**Problem**: API calls failing
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is running and accessible

**Problem**: Build fails
- Check Netlify build logs
- Verify all dependencies are in `package.json`
- Ensure Node version is compatible

**Problem**: Environment variables not working
- Variables must start with `REACT_APP_` to be accessible in React
- Rebuild after adding new variables

## Important Notes

1. **Free Tier Limitations**:
   - Render free tier: Services spin down after 15 minutes of inactivity
   - Netlify free tier: 100GB bandwidth/month
   - First request to Render after spin-down may take 30-60 seconds

2. **Environment Variables**:
   - Never commit `.env` files to Git
   - Set all sensitive variables in deployment platforms
   - Use different values for production vs development

3. **Database**:
   - Use MongoDB Atlas for production
   - Update connection string in Render environment variables
   - Whitelist Render IPs in MongoDB Atlas

4. **Security**:
   - Use strong JWT secrets in production
   - Enable HTTPS (automatic on Netlify and Render)
   - Keep dependencies updated

## Support

If you encounter issues:
1. Check deployment logs in Netlify/Render dashboards
2. Verify environment variables are set correctly
3. Test API endpoints directly using Postman/curl
4. Check browser console for frontend errors





