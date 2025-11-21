# 🚀 Quick Deploy Guide

## Deploy to Render.com in 3 Steps

### Step 1: Prepare Your Code
```bash
./deploy-setup.sh
```

### Step 2: Push to GitHub

1. Create a new GitHub repository at https://github.com/new
   - Name: `alphapath-backend`
   
2. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/alphapath-backend.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**
6. Wait 5-10 minutes ⏳

**Your API will be live at**: `https://alphapath-api.onrender.com`

---

## 🎯 What Gets Deployed

✅ **PostgreSQL Database** (Free tier)
- 256 MB RAM
- 1 GB storage
- Automatic backups

✅ **API Service** (Free tier)
- 512 MB RAM
- Auto-deploy on git push
- Free SSL certificate
- Health monitoring

---

## 🔧 Environment Variables (Auto-configured)

The following variables are automatically set via `render.yaml`:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | production | Runtime environment |
| `PORT` | 10000 | Server port (Render default) |
| `DATABASE_URL` | Auto-generated | PostgreSQL connection string |
| `JWT_SECRET` | Auto-generated | JWT signing secret |
| `JWT_REFRESH_SECRET` | Auto-generated | Refresh token secret |
| `CORS_ORIGIN` | * | Allow all origins (change for production) |

---

## 📝 Post-Deployment Tasks

### 1. Seed Test Data

Option A: Use Render Shell
```bash
# In Render dashboard → Shell tab
psql $DATABASE_URL < seed-courses.sql
```

Option B: Create via API
```bash
curl -X POST https://alphapath-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alphapath.com",
    "password": "SecurePass123!",
    "fullName": "Admin User"
  }'
```

### 2. Test Your API

```bash
# Health check
curl https://alphapath-api.onrender.com/health

# Get courses
curl https://alphapath-api.onrender.com/api/courses

# Login
curl -X POST https://alphapath-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alphapath.com","password":"SecurePass123!"}'
```

### 3. Update Frontend

Update your frontend API base URL to:
```javascript
const API_BASE_URL = 'https://alphapath-api.onrender.com/api';
```

---

## ⚠️ Free Tier Limitations

- **Spin-down**: Service sleeps after 15 minutes of inactivity
- **Cold start**: ~30-60 seconds for first request after sleep
- **Database**: Free for 90 days, then $7/month
- **Uptime**: 750 hours/month

### Keep Service Active

Use a cron service to ping every 10 minutes:
```
GET https://alphapath-api.onrender.com/health
```

Recommended services:
- [cron-job.org](https://cron-job.org) (free)
- [UptimeRobot](https://uptimerobot.com) (free)

---

## 🔐 Production Security Checklist

Before going live:

- [ ] Change JWT secrets (use strong random values)
- [ ] Update `CORS_ORIGIN` to specific frontend URLs
- [ ] Enable rate limiting (already configured)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure custom domain
- [ ] Review database access controls
- [ ] Enable 2FA on Render account

---

## 🐛 Troubleshooting

### Build Failed
```bash
# Check logs in Render dashboard
# Common issues:
- Missing dependencies in package.json
- TypeScript compilation errors
- Migration failures
```

### Database Connection Error
```bash
# Verify DATABASE_URL is set
# Check database is in same region
# Ensure database is active (not paused)
```

### API Returns 502/503
```bash
# Service is spinning up (cold start)
# Wait 30-60 seconds and retry
```

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions and alternative hosting options.

---

## 🎉 Success!

Your API is now live and accessible worldwide!

**Base URL**: `https://alphapath-api.onrender.com`

**Next Steps**:
1. Update your frontend to use the deployed API
2. Test all endpoints
3. Monitor logs and performance
4. Consider upgrading for production use

---

Made with ❤️ for AlphaPath Academy
