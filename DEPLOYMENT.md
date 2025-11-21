# AlphaPath Backend - Deployment Guide

## 🚀 Deploy to Render.com (Free Tier)

This guide will help you deploy the AlphaPath Academy backend API to Render.com's free tier.

### Prerequisites
- GitHub account
- Render.com account (sign up at https://render.com)

### Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
```bash
cd /Users/nykb/Downloads/alphapath_backend
git init
git add .
git commit -m "Initial commit - AlphaPath Backend"
```

2. Create a new repository on GitHub (https://github.com/new)
   - Name: `alphapath-backend`
   - Keep it public or private

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/alphapath-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render

#### Option A: Using Blueprint (Recommended)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account if not already connected
4. Select the `alphapath-backend` repository
5. Render will detect the `render.yaml` file and create:
   - PostgreSQL database (alphapath-db)
   - Web service (alphapath-api)
6. Click **"Apply"**
7. Wait for deployment (~5-10 minutes)

#### Option B: Manual Setup

##### 2.1 Create PostgreSQL Database

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `alphapath-db`
   - **Database**: `alphapath`
   - **User**: `alphapath_user`
   - **Region**: Oregon (US West) or closest to you
   - **Plan**: Free
4. Click **"Create Database"**
5. Copy the **Internal Database URL** (you'll need this)

##### 2.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `alphapath-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build && npm run migrate`
   - **Start Command**: `npm run start`
   - **Plan**: Free

##### 2.3 Configure Environment Variables

Add these environment variables in the Render dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | Paste the Internal Database URL from Step 2.1 |
| `JWT_SECRET` | Generate a random 64-char string |
| `JWT_REFRESH_SECRET` | Generate another random 64-char string |
| `CORS_ORIGIN` | `*` (or specify your frontend URLs) |

**Generate secrets using:**
```bash
# On Mac/Linux
openssl rand -hex 32
```

4. Click **"Create Web Service"**

### Step 3: Seed Initial Data (Optional)

Once deployed, you can seed the database with test data:

1. Go to your web service in Render dashboard
2. Click **"Shell"** tab
3. Run:
```bash
psql $DATABASE_URL < seed-courses.sql
```

Or create an admin user via API:
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alphapath.com",
    "password": "SecurePass123!",
    "fullName": "Admin User"
  }'
```

### Step 4: Test Your Deployment

Your API will be available at: `https://your-app-name.onrender.com`

Test endpoints:
```bash
# Health check
curl https://your-app-name.onrender.com/health

# Get courses
curl https://your-app-name.onrender.com/api/courses

# Login
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alphapath.com","password":"SecurePass123!"}'
```

## 📝 Important Notes

### Free Tier Limitations
- **Web Service**: 750 hours/month, spins down after 15 min inactivity
- **Database**: 90 days, then requires payment ($7/month)
- **Cold starts**: First request after inactivity takes ~30-60 seconds

### Keeping Service Active
The free tier spins down after 15 minutes of inactivity. To keep it active:
1. Use a service like [cron-job.org](https://cron-job.org)
2. Ping your health endpoint every 10 minutes:
   ```
   GET https://your-app-name.onrender.com/health
   ```

### Database Migration
The build command includes `npm run migrate`, which automatically:
1. Creates all tables
2. Sets up indexes and constraints
3. Ready for data seeding

## 🔧 Troubleshooting

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles: `npm run build`

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- Check database is in same region as web service
- Ensure database is not paused

### CORS Errors
- Update `CORS_ORIGIN` env var to include your frontend URL
- Example: `https://yourdomain.com,http://localhost:3000`

### Cold Start Performance
- First request after spin-down takes 30-60 seconds
- Subsequent requests are fast (~100-500ms)

## 📊 Monitoring

### View Logs
1. Go to your web service in Render
2. Click **"Logs"** tab
3. Monitor real-time application logs

### Metrics
- Click **"Metrics"** to see:
  - Request count
  - Response times
  - Memory usage
  - CPU usage

## 🔐 Security Best Practices

1. **Change Default Secrets**: Generate new JWT secrets for production
2. **Restrict CORS**: Set specific frontend URLs instead of `*`
3. **Enable HTTPS**: Render provides free SSL certificates automatically
4. **Environment Variables**: Never commit `.env` file to git
5. **Database Backups**: Render free tier includes daily backups

## 🌐 Alternative Free Hosting Options

If you need alternatives to Render:

### Railway.app
- $5 free credit/month
- Easy deployment
- Good for small projects

### Fly.io
- Free tier: 3 VMs, 3GB RAM
- Global edge network
- Docker-based

### Heroku
- Limited free tier (requires credit card)
- Easy to use
- Popular choice

### Vercel (with PostgreSQL elsewhere)
- Free for API routes
- Need external database (Supabase, Neon)

## 📚 Next Steps

1. **Update Frontend**: Point your frontend to deployed API URL
2. **Custom Domain**: Add custom domain in Render settings
3. **Monitoring**: Set up error tracking (Sentry, LogRocket)
4. **Documentation**: Update API docs with production URL

---

## Quick Reference

**Base URL**: `https://your-app-name.onrender.com`

**Endpoints**:
- Health: `GET /health`
- Courses: `GET /api/courses`
- Auth: `POST /api/auth/login`, `POST /api/auth/register`
- Community: `GET /api/community/posts`

**Test Credentials** (after seeding):
- Email: `admin@test.com`
- Password: `Admin123!`
