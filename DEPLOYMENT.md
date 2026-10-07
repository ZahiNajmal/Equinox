# Render Deployment Guide

This guide explains how to deploy the Equinox application to Render.

## Prerequisites

- A Render account (free tier available)
- Google AI Studio API key
- NewsAPI.org API key (free tier available)
- GitHub repository with your code

## Step 1: Prepare Your Code

1. Ensure your code is pushed to a GitHub repository
2. Verify `.env.example` is in the repo (this is safe to commit)
3. Do NOT commit your actual `.env` file with real API keys

## Step 2: Set Up PostgreSQL Database on Render

1. Go to Render Dashboard → New → PostgreSQL
2. Choose a name (e.g., `equinox-db`)
3. Select the free tier
4. Click "Create Database"
5. After creation, copy the **Internal Database URL** - this is your `DATABASE_URL`

## Step 3: Deploy the Backend (Web Service)

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure the web service:
   - **Name**: `equinox-api` (or your preferred name)
   - **Root Directory**: `server` (if using monorepo structure)
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Runtime**: Node (latest LTS or >= 20)

4. **Environment Variables** (Critical - do NOT use `VITE_` prefix):
   - `GOOGLE_AI_KEY` = Your Google AI Studio API key
   - `NEWSAPI_KEY` = Your NewsAPI.org API key
   - `DATABASE_URL` = (Paste from Step 2)
   - `JWT_SECRET` = Generate a secure random string (e.g., use `openssl rand -base64 32`)
   - `NODE_ENV` = `production`

5. Click "Create Web Service"

## Step 4: Deploy the Frontend (Static Site)

### Option A: Use the Backend to Serve Frontend (Recommended)

If you're using the monorepo setup where the backend serves the frontend:

1. The backend build script in `server/package.json` will build the client
2. The backend `index.js` already serves the built frontend from `client/dist`
3. You only need the single web service from Step 3

### Option B: Separate Frontend Deployment

If you prefer separate deployments:

1. Go to Render Dashboard → New → Static Site
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Add Environment Variable**: `VITE_API_URL` = Your backend URL (e.g., `https://equinox-api.onrender.com`)

## Step 5: Verify Deployment

1. Wait for both services to finish deploying
2. Visit your web service URL (e.g., `https://equinox-api.onrender.com`)
3. Test the features:
   - Sign up / Login
   - AI Mentor (should use `GOOGLE_AI_KEY`)
   - News feed (should use `NEWSAPI_KEY`)
   - Other features

## Troubleshooting

### AI Agent Returns 500 Error

**Cause**: Wrong environment variable name
- **Wrong**: `VITE_GOOGLE_AI_KEY`
- **Correct**: `GOOGLE_AI_KEY`

**Fix**:
1. Go to your Render web service
2. Settings → Environment Variables
3. Add `GOOGLE_AI_KEY` with your API key
4. Remove any `VITE_GOOGLE_AI_KEY` if present
5. Redeploy

### News Feed Shows 500 Error

**Cause**: Wrong environment variable name
- **Wrong**: `VITE_NEWSAPI_KEY`
- **Correct**: `NEWSAPI_KEY`

**Fix**:
1. Go to your Render web service
2. Settings → Environment Variables
3. Add `NEWSAPI_KEY` with your API key
4. Remove any `VITE_NEWSAPI_KEY` if present
5. Redeploy

### Database Connection Errors

**Cause**: SSL issues with PostgreSQL on Render

**Fix**: The code already handles this with:
```javascript
if (process.env.DATABASE_URL.includes('render.com')) {
  dbConfig.ssl = { rejectUnauthorized: false };
}
```

If you still see errors, check:
1. `DATABASE_URL` is correctly set in environment variables
2. The PostgreSQL database is running on Render
3. No typos in the connection string

### Frontend Not Loading

**Cause**: Build path or serving issues

**Fix**:
1. Check that `client/dist` exists after build
2. Verify the backend `index.js` is serving the correct path
3. Check Render logs for build errors

## Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GOOGLE_AI_KEY` | Yes | Google AI Studio API key | `AIzaSy...` |
| `NEWSAPI_KEY` | Yes | NewsAPI.org API key | `abc123...` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgres://...` |
| `JWT_SECRET` | Yes | Secret for JWT tokens | `random-secret-string` |
| `NODE_ENV` | Yes | Environment | `production` |
| `PORT` | No | Server port (Render sets this) | `5000` |

## Cost Considerations

- **Render Free Tier**: 
  - Web Service: 750 hours/month (free)
  - PostgreSQL: 90 days free, then $7/month
  - Static Site: Free

- **API Costs**:
  - Google AI Studio: Free tier available, monitor usage
  - NewsAPI.org: Free tier (100 requests/day)

## Updating Your Deployment

When you push changes to GitHub:
1. Render will automatically redeploy on push to the main branch
2. Monitor the deployment logs for errors
3. If environment variables change, update them in Render dashboard

## Security Notes

- Never commit `.env` files with real API keys
- Use strong `JWT_SECRET` values
- Rotate API keys periodically
- Monitor Render logs for any unusual activity
