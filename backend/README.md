# 🚀 JMJ Hyderabad Backend CMS

Admin Content Management System for JMJ Hyderabad Province Website

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

✅ **Admin Authentication**
- Email/password login
- JWT token-based authentication
- Secure password hashing (bcrypt)
- Account lockout after failed attempts
- Auto-logout functionality

✅ **News Management**
- Create, read, update, delete news articles
- Draft and publish functionality
- Featured articles
- Category organization
- SEO optimization
- Rich text support

✅ **Notice Management**
- Post announcements and notices
- Urgency levels (low, medium, high, critical)
- Expiry dates
- File attachments
- Auto-archiving expired notices

✅ **Gallery Management**
- Create image galleries
- Bulk image upload
- Image captions
- Event-based organization
- Featured galleries

✅ **Dashboard Analytics**
- View statistics
- Track article views
- Monitor user engagement
- Recent activity logs

---

## 🛠️ Tech Stack

**Backend**
- **Node.js** 18+ - Runtime
- **Express.js** 4.x - Web framework
- **MongoDB** 5.x - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage

**Development**
- **Nodemon** - Hot reload
- **Jest** - Testing

---

## 📦 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **npm** (v9 or higher)
   ```bash
   npm --version
   ```

3. **MongoDB** (Free tier on MongoDB Atlas)
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a cluster and get connection string

4. **Cloudinary Account** (Optional, for image upload)
   - Sign up at https://cloudinary.com
   - Get API credentials

---

## 🚀 Local Setup

### 1. Clone or Download Backend

```bash
# Clone repository
git clone <your-repo-url>
cd jmj-backend

# Or extract if downloaded as ZIP
unzip jmj-backend.zip
cd jmj-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your editor
```

### 4. Configure .env File

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jmj_hyderabad

# JWT Secret (create a random string)
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRES_IN=24h

# Frontend URLs
FRONTEND_URL=http://localhost:5173
FRONTEND_URL_PROD=https://jmjprovincehyd.vercel.app

# Cloudinary (optional)
CLOUDINARY_NAME=your_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
```

### 5. Start Development Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### 6. Test Backend

```bash
# Test health endpoint
curl http://localhost:5000/api/health   # or /api/v1/health

# Response:
# {"status":"OK","message":"JMJ Hyderabad Backend is running"}
```

---

## 🔐 First Time Setup

### Register First Admin

```bash
# Use Postman or curl
POST http://localhost:5000/api/v1/auth/register

Body (JSON):
{
  "name": "Admin Name",
  "email": "admin@jmj.org",
  "password": "SecurePassword123!",
  "phone": "9999999999",
  "organization": "JMJ Hyderabad Province"
}
```

Response:
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "token": "eyJhbGc...",
  "admin": {
    "id": "...",
    "name": "Admin Name",
    "email": "admin@jmj.org",
    "role": "super_admin"
  }
}
```

### Login

```bash
POST http://localhost:5000/api/v1/auth/login

Body (JSON):
{
  "email": "admin@jmj.org",
  "password": "SecurePassword123!"
}
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register       - Register new admin
POST   /api/auth/login          - Login
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Get current admin
POST   /api/auth/change-password - Change password
GET    /api/auth/verify         - Verify token
```

### News

```
GET    /api/news                - Get all news
GET    /api/news/featured       - Get featured news
GET    /api/news/:id            - Get single news
GET    /api/news/search?q=      - Search news
POST   /api/news                - Create news (admin)
PUT    /api/news/:id            - Update news (admin)
DELETE /api/news/:id            - Delete news (admin)
```

### Notices

```
GET    /api/notices             - Get all notices
GET    /api/notices/:id         - Get single notice
POST   /api/notices             - Create notice (admin)
PUT    /api/notices/:id         - Update notice (admin)
DELETE /api/notices/:id         - Delete notice (admin)
```

### Gallery

```
GET    /api/gallery             - Get all galleries
GET    /api/gallery/:id         - Get single gallery
POST   /api/gallery             - Create gallery (admin)
PUT    /api/gallery/:id         - Update gallery (admin)
DELETE /api/gallery/:id         - Delete gallery (admin)
POST   /api/gallery/:id/upload  - Upload images (admin)
```

### Contact form

```
POST   /api/v1/contact          - Website contact form (public, rate-limited)
GET    /api/v1/contact          - Inbox (admin) — ?status=new|read|replied|archived
GET    /api/v1/contact/:id      - One message (admin)
PATCH  /api/v1/contact/:id      - Set status (admin) — { "status": "replied" }
DELETE /api/v1/contact/:id      - Delete (admin)
```

### Admin

```
GET    /api/v1/admin/stats      - Dashboard stats (admin)
GET    /api/v1/admin/analytics  - Analytics data (admin)
```

> All routes are under **/api/v1** (e.g. `/api/v1/news`). Visitors only ever receive
> *published* items; send the admin token and `?status=` (empty) to list drafts too.

---

## 🔐 Authentication

### Bearer Token Usage

Include JWT token in request headers:

```bash
Authorization: Bearer <your_jwt_token>
```

Example with curl:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/v1/admin/stats
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/                 # MongoDB schemas
│   │   ├── Admin.js
│   │   ├── News.js
│   │   ├── Notice.js
│   │   └── Gallery.js
│   │
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   └── newsController.js
│   │
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── news.js
│   │   ├── notices.js
│   │   └── gallery.js
│   │
│   ├── middleware/             # Custom middleware
│   │   └── auth.js
│   │
│   ├── utils/                  # Helper functions
│   │   └── jwt.js
│   │
│   └── server.js              # Main server file
│
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # This file
```

---

## 🌐 Deployment

### Deploy to Render (FREE)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Backend setup"
   git push origin main
   ```

2. **Go to Render.com**
   - Sign up and login
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Fill in details:
     - Name: `jmj-hyderabad-backend`
     - Runtime: Node
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all from .env file

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Get your URL: `https://jmj-hyderabad-backend.onrender.com`

### Deploy to Railway

1. **Connect GitHub** - Go to railway.app
2. **Create Project** - Click "New Project"
3. **Select Repository**
4. **Add Variables** - From .env file
5. **Deploy** - Automatic deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
# Create account on heroku.com

heroku login
heroku create jmj-hyderabad-backend
heroku config:set PORT=5000
heroku config:set NODE_ENV=production
# Set other env variables...
git push heroku main
```

---

## 🗄️ Database Setup

### MongoDB Atlas (Free Tier)

1. **Create Account** - https://www.mongodb.com/cloud/atlas

2. **Create Cluster**
   - Select free tier
   - Choose region: Asia (Mumbai)
   - Click Create

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace with your username/password

4. **Add to .env**
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/jmj_hyderabad
   ```

---

## 🖼️ Image Upload Setup

### Using Cloudinary (FREE)

1. **Create Account** - https://cloudinary.com

2. **Get API Credentials**
   - Dashboard → Settings → API Keys
   - Copy: Cloud Name, API Key, API Secret

3. **Add to .env**
   ```
   CLOUDINARY_NAME=your_name
   CLOUDINARY_KEY=your_key
   CLOUDINARY_SECRET=your_secret
   ```

---

## 🧪 Testing

Automated API tests (use a throwaway database — it is wiped):

```bash
MONGODB_URI_TEST=mongodb://localhost:27017/jmj_test npm test
```

Backups and admin recovery:

```bash
npm run backup
npm run create-admin -- "Full Name" email@example.com "NewPassword123"
```


### Test with Postman

1. Download Postman
2. Import collection from examples
3. Set base URL: `http://localhost:5000`
4. Set auth token in headers
5. Run requests

### Test Endpoints

```bash
# Health check
curl http://localhost:5000/api/health   # or /api/v1/health

# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Admin",
    "email":"admin@jmj.org",
    "password":"Password123"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@jmj.org",
    "password":"Password123"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error**: `MongoServerSelectionError`

**Solution**:
1. Check internet connection
2. Verify MONGODB_URI in .env
3. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)
4. Check credentials (username/password)

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### JWT Token Expired

**Error**: `Invalid or expired token`

**Solution**:
1. Get new token via login endpoint
2. Update token in Authorization header
3. Check JWT_EXPIRES_IN in .env

### Cloudinary Upload Error

**Error**: `Cloudinary credentials not found`

**Solution**:
1. Check .env has CLOUDINARY_* variables
2. Verify credentials are correct
3. Check internet connection
4. Create new Cloudinary account if needed

---

## 📞 Support

For issues or questions:
1. Check error messages carefully
2. Review logs in terminal
3. Check MongoDB connection
4. Verify .env configuration
5. Check GitHub issues

---

## 📄 License

MIT License - See LICENSE file

---

## ✅ Next Steps

1. ✅ Setup backend locally
2. ✅ Test all endpoints
3. ⏳ Deploy to Render/Railway
4. ⏳ Connect frontend to backend
5. ⏳ Build admin dashboard UI

---

**Backend is ready! Next: Build the Admin Dashboard UI 🎨**
