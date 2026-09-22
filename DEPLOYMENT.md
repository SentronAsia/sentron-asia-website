# Sentron Asia International — Deployment Guide

## Architecture Overview

```
┌─────────────────────┐         ┌─────────────────────┐
│   Frontend (SPA)    │  REST   │   Backend (API)     │
│   React + Vite      │ ──────▶ │   Express + Node.js │
│   Hosted on Vercel  │         │   Vercel / Render   │
└─────────────────────┘         └────────┬────────────┘
                                         │
                                         ▼
                                ┌─────────────────────┐
                                │     MongoDB Atlas    │
                                │    (Cloud Database)  │
                                └─────────────────────┘
```

---

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (or AWS S3 bucket)
- Vercel account (for frontend + optionally backend)

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | Yes | Frontend URL (e.g., `https://sentronasia.vercel.app`) |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret key for JWT signing (min 32 characters) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `EMAIL_PROVIDER` | No | `posttodev` or `nodemailer` (default: `posttodev`) |
| `POSTTODEV_ENDPOINT` | If using PostTo.dev | PostTo.dev API endpoint |
| `SMTP_HOST` | If using Nodemailer | SMTP server host |
| `SMTP_PORT` | If using Nodemailer | SMTP port (587 or 465) |
| `SMTP_USER` | If using Nodemailer | SMTP username |
| `SMTP_PASS` | If using Nodemailer | SMTP password |
| `EMAIL_FROM` | No | Sender email address |
| `STORAGE_PROVIDER` | No | `cloudinary` or `s3` (default: `cloudinary`) |
| `CLOUDINARY_CLOUD_NAME` | If using Cloudinary | Cloud name |
| `CLOUDINARY_API_KEY` | If using Cloudinary | API key |
| `CLOUDINARY_API_SECRET` | If using Cloudinary | API secret |
| `AWS_REGION` | If using S3 | AWS region |
| `AWS_S3_BUCKET` | If using S3 | S3 bucket name |
| `AWS_ACCESS_KEY_ID` | If using S3 | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | If using S3 | AWS secret key |
| `ADMIN_EMAIL` | No | Admin email (default: `sentronasia@yahoo.com`) |

### Frontend (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | **Yes** | Backend API URL (e.g., `https://sentron-api.vercel.app/api`) |

---

## Local Development

### 1. Clone and Install

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Configure Environment

```bash
# Copy env templates
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit server/.env with your MongoDB URI, JWT secret, etc.
# Edit client/.env (default localhost should work for dev)
```

### 3. Seed Admin User

```bash
cd server
npm run seed
```

This creates or updates the admin account:
- **Email:** `sentronasia@yahoo.com`
- **Password:** `36672209SentronAsia@`

### 4. Run Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Admin panel: http://localhost:5173/admin/login

---

## Production Deployment

### Frontend on Vercel

1. Push `client/` to a Git repository
2. Import to Vercel
3. **Build Settings:**
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   - `VITE_API_BASE_URL` = your backend URL + `/api`
5. Deploy

The `vercel.json` in `client/` handles SPA rewrites automatically.

### Backend Option A: Vercel Serverless Functions

1. Push `server/` to a separate Git repository
2. Import to Vercel
3. **Build Settings:**
   - Root Directory: `server`
   - Framework Preset: Other
4. **Environment Variables:** All variables from the table above
5. The `vercel.json` and `api/index.js` handle serverless routing

### Backend Option B: Render / Railway

1. Push `server/` to a Git repository
2. Create a new Web Service on Render or Railway
3. **Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `server`
4. **Environment Variables:** All variables from the table above
5. Deploy

---

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write access
3. Whitelist your server's IP address (or `0.0.0.0/0` for serverless)
4. Get the connection string and set it as `MONGODB_URI`

---

## Security Checklist

- [ ] Change the default admin password immediately after first login
- [ ] Use a strong `JWT_SECRET` (min 32 random characters)
- [ ] Set `CORS_ORIGIN` to your exact frontend URL in production
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Use HTTPS for all production URLs
- [ ] Store all secrets in environment variables, never in code
