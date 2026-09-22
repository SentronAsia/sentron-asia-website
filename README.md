# Sentron Asia International — Corporate Website & CMS

Full-stack MERN application: React 19 + Vite frontend with Tailwind CSS v4 oklch semantic tokens, Express.js REST API backend, MongoDB/Mongoose, custom JWT authentication, and a SaaS-style CMS admin dashboard.

## Quick Start

```bash
# 1. Install dependencies
cd client && npm install
cd ../server && npm install

# 2. Configure environment
cp server/.env.example server/.env  # Edit with your values
cp client/.env.example client/.env

# 3. Seed admin user
cd server && npm run seed

# 4. Start dev servers
cd server && npm run dev    # Terminal 1
cd client && npm run dev    # Terminal 2
```

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, TanStack Query, React Router v7
- **Backend:** Node.js, Express.js, Mongoose, JWT, Zod, Multer
- **Database:** MongoDB Atlas
- **Storage:** Cloudinary or AWS S3
- **Email:** Nodemailer or PostTo.dev API
- **Deployment:** Vercel (frontend SPA) + Vercel Serverless / Render (backend)

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Full deployment guide, env vars, and setup instructions
