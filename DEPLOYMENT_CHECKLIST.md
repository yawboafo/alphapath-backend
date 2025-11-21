# AlphaPath Academy Backend - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Local Development Setup
- [x] Node.js 18+ installed
- [x] PostgreSQL 15+ installed
- [x] All dependencies installed (`npm install`)
- [x] `.env` file configured with database credentials
- [ ] PostgreSQL database created (`createdb alphapath_db`)
- [ ] Database migrations run (`npm run migrate`)
- [ ] Server starts successfully (`npm run dev`)
- [ ] Health check endpoint working (`curl http://localhost:5000/health`)

### 2. Database Setup
- [ ] PostgreSQL database created
- [ ] All 13 tables created via migrations
- [ ] Database indexes created
- [ ] Sample data loaded (optional)
- [ ] Database backups configured

### 3. Environment Variables
- [ ] All required variables set in `.env`
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database credentials correct
- [ ] CORS origins configured for production
- [ ] Rate limiting configured appropriately

### 4. API Testing
- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] Course listing works
- [ ] Course enrollment works
- [ ] Progress tracking works
- [ ] Community posts work
- [ ] All error responses are proper

### 5. Security Checklist
- [x] Passwords hashed with bcrypt
- [x] JWT tokens properly configured
- [x] Rate limiting enabled
- [x] Input validation with Joi
- [x] SQL injection protection (parameterized queries)
- [x] CORS configured
- [x] Helmet security headers
- [ ] HTTPS enabled (production only)
- [ ] Environment variables not committed to git

### 6. Code Quality
- [x] TypeScript compilation successful
- [x] No TypeScript errors (after `npm run build`)
- [ ] ESLint passes
- [ ] Code formatted with Prettier
- [ ] All imports resolved
- [ ] No unused variables

---

## 🚀 Deployment Steps

### Option 1: Deploy to Railway

1. **Create Railway Account**
   - Go to railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select alphapath_backend repository

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Database will be provisioned automatically
   - Note the connection URL

4. **Configure Environment Variables**
   - Go to Variables tab
   - Add all variables from `.env`
   - Set `NODE_ENV=production`
   - Set `DATABASE_URL` from Railway PostgreSQL
   - Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`

5. **Deploy**
   - Railway will automatically deploy
   - Run migrations: `npm run migrate`
   - Check deployment logs
   - Test API endpoints

6. **Get Production URL**
   - Railway provides: `https://your-app.railway.app`
   - Update Flutter app with this URL

**Cost**: $5-20/month

---

### Option 2: Deploy to Render

1. **Create Render Account**
   - Go to render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Name: alphapath-backend
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: alphapath-db
   - Copy connection string

4. **Configure Environment Variables**
   - In Web Service settings → Environment
   - Add all variables from `.env`
   - Set `DATABASE_URL` from PostgreSQL instance

5. **Deploy**
   - Render will auto-deploy on push
   - Run migrations via Render Shell
   - Monitor deployment logs

**Cost**: $7-25/month (free tier available)

---

### Option 3: Deploy to AWS

1. **Create EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro or t2.small
   - Configure security groups (port 22, 80, 443, 5000)

2. **SSH into Server**
   ```bash
   ssh -i your-key.pem ubuntu@your-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PostgreSQL**
   ```bash
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   ```

5. **Clone Repository**
   ```bash
   git clone https://github.com/your-repo/alphapath_backend.git
   cd alphapath_backend
   npm install
   ```

6. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

7. **Run Migrations**
   ```bash
   npm run migrate
   ```

8. **Install PM2**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "alphapath-api" -- start
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx (Optional)**
   ```bash
   sudo apt-get install nginx
   # Configure reverse proxy
   ```

10. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.alphapath.com
    ```

**Cost**: $10-50/month

---

## 🔒 Production Environment Variables

Create a `.env.production` file:

```bash
NODE_ENV=production
PORT=5000
API_URL=https://api.alphapath.com

# Database (use managed PostgreSQL in production)
DATABASE_URL=postgresql://user:pass@host:5432/alphapath_prod

# JWT (GENERATE NEW SECRETS!)
JWT_SECRET=<generate-strong-secret-here>
JWT_REFRESH_SECRET=<generate-strong-secret-here>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (your production domains)
CORS_ORIGIN=https://alphapath.com,https://app.alphapath.com

# Rate Limiting (adjust for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Generate strong secrets:
```bash
openssl rand -base64 32
```

---

## 📊 Post-Deployment Checklist

### 1. Smoke Tests
- [ ] Health check: `curl https://your-api.com/health`
- [ ] Register new user via API
- [ ] Login via API
- [ ] Get user profile
- [ ] List courses
- [ ] Create community post
- [ ] All responses are JSON with correct format

### 2. Performance Tests
- [ ] API response time < 200ms
- [ ] Database queries < 50ms
- [ ] Load test with 100 concurrent users
- [ ] Memory usage stable
- [ ] No memory leaks

### 3. Monitoring Setup
- [ ] Server logs accessible
- [ ] Error logging working (Winston)
- [ ] Database connection monitoring
- [ ] API response time monitoring
- [ ] Disk space alerts
- [ ] Memory usage alerts

### 4. Database Backups
- [ ] Automated daily backups
- [ ] Backup retention policy (7-30 days)
- [ ] Backup restoration tested
- [ ] Point-in-time recovery configured

### 5. Security Hardening
- [ ] HTTPS enforced
- [ ] Strong JWT secrets in production
- [ ] Database not exposed to public
- [ ] SSH key-based authentication only
- [ ] Firewall configured
- [ ] Regular security updates scheduled

### 6. Documentation
- [ ] API documentation published
- [ ] Postman collection shared with team
- [ ] Deployment runbook created
- [ ] Incident response plan documented
- [ ] Team access credentials secured

---

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Check logs
npm run dev

# Check if port is in use
lsof -i :5000

# Check environment variables
cat .env
```

### Database Connection Failed
```bash
# Test PostgreSQL connection
psql -U postgres -d alphapath_db -c "SELECT NOW();"

# Check DATABASE_URL format
echo $DATABASE_URL

# Verify database exists
psql -U postgres -l | grep alphapath
```

### Migrations Failed
```bash
# Check migration status
psql -U postgres -d alphapath_db -c "SELECT * FROM migrations;"

# Re-run migrations
npm run migrate

# Manual migration
psql -U postgres -d alphapath_db < src/migrations/001_create_users.sql
```

### API Returns 500 Errors
```bash
# Check server logs
tail -f logs/error.log

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Enable debug mode
NODE_ENV=development npm run dev
```

---

## 📱 Flutter App Integration

After backend is deployed, update Flutter app:

1. **Update API Base URL**
   ```dart
   // lib/core/constants/api_constants.dart
   static const String baseUrl = 'https://your-api.railway.app';
   ```

2. **Test Authentication**
   - Register new user from Flutter app
   - Login and store tokens
   - Test authenticated endpoints

3. **Test All Features**
   - Course listing
   - Course enrollment
   - Video playback
   - Progress tracking
   - Community posts

---

## 📈 Scaling Checklist (Future)

When you reach 1000+ active users:

- [ ] Add Redis for caching
- [ ] Implement CDN for static assets
- [ ] Add read replicas for database
- [ ] Implement horizontal scaling
- [ ] Add queue system for async tasks
- [ ] Implement full-text search
- [ ] Add analytics tracking
- [ ] Set up APM (Application Performance Monitoring)

---

## 🎯 Success Metrics

Your backend is production-ready when:

- ✅ All API endpoints return expected responses
- ✅ Authentication flow works end-to-end
- ✅ Flutter app can connect and function
- ✅ Database is backed up daily
- ✅ Monitoring and alerts are configured
- ✅ HTTPS is enabled (production)
- ✅ API response time < 200ms
- ✅ Uptime > 99.5%

---

## 📞 Support

If you encounter issues:

1. Check logs: `logs/error.log`
2. Review documentation: `README.md`, `SETUP_GUIDE.md`, `API_DOCUMENTATION.md`
3. Test with Postman collection
4. Check GitHub Issues
5. Contact: support@alphapath.com

---

**Created**: November 21, 2024
**Last Updated**: November 21, 2024
**Status**: ✅ Ready for Deployment
