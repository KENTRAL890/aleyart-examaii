# ALEYART EXAMAI PRO — Free Deployment Guide
# ══════════════════════════════════════════════
# Deploy 100% FREE using:
#   Backend + Database → Railway.app
#   Frontend           → Vercel.com
# ══════════════════════════════════════════════

## OVERVIEW
┌─────────────────────────────────────────────────┐
│  Frontend (React)   →  Vercel (free forever)    │
│  Backend (Node.js)  →  Railway (free $5/month)  │
│  Database (MySQL)   →  Railway MySQL plugin      │
│  AI Engine          →  Anthropic (your API key) │
└─────────────────────────────────────────────────┘

Total cost: $0 (Railway gives $5 free credit/month,
enough for a school system with light traffic)

════════════════════════════════════════════════════
 PART 1 — PUSH YOUR CODE TO GITHUB (required first)
════════════════════════════════════════════════════

1. Go to https://github.com and sign in (or create free account)

2. Click the "+" icon → "New repository"
   - Name: aleyart-examai-pro
   - Set to: Private  ← IMPORTANT (keeps your code safe)
   - Do NOT check "Add README"
   - Click "Create repository"

3. In VS Code, open Terminal (Ctrl+`) and run:

   cd path/to/aleyart        ← go to your project root folder

   git init
   git add .
   git commit -m "Initial commit — ALEYART EXAMAI PRO v2.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/aleyart-examai-pro.git
   git push -u origin main

   Replace YOUR_USERNAME with your actual GitHub username.

4. Refresh your GitHub page — you should see all files uploaded.

════════════════════════════════════════════════════
 PART 2 — DEPLOY BACKEND + DATABASE ON RAILWAY
════════════════════════════════════════════════════

Railway gives you a free MySQL database + Node.js server.

STEP 1 — Create Railway account
  Go to: https://railway.app
  Click "Login with GitHub" — use the same GitHub account

STEP 2 — Create a new project
  Click "New Project"
  Select "Deploy from GitHub repo"
  Select your "aleyart-examai-pro" repository
  Click "Deploy Now"

STEP 3 — Add MySQL database
  Inside your Railway project, click "+ New"
  Select "Database" → "MySQL"
  Railway creates a MySQL 8 database automatically.
  Click on the MySQL service → "Variables" tab
  Copy the value of: MYSQL_URL  (you will need this)

STEP 4 — Configure backend environment variables
  Click on your web service (aleyart-examai-pro)
  Click "Variables" tab → "Add Variable"
  Add these one by one:

  Variable Name          Value
  ─────────────────────────────────────────────────────────────
  NODE_ENV               production
  PORT                   5000
  DATABASE_URL           [paste the MYSQL_URL you copied above]
  JWT_SECRET             [generate: any 64-char random string]
  JWT_REFRESH_SECRET     [generate: different 64-char string]
  ANTHROPIC_API_KEY      [your sk-ant-... key]
  ALLOWED_ORIGINS        https://aleyart-examai-pro.vercel.app
  ADMIN_PASSWORD         Admin@2025!

  To generate JWT secrets, run this in VS Code terminal:
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  Run it twice, use each result for JWT_SECRET and JWT_REFRESH_SECRET.

STEP 5 — Set the root directory and start command
  Click your web service → "Settings" tab
  Root Directory:  backend
  Start Command:   node src/server.js
  Build Command:   npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js

STEP 6 — Deploy
  Click "Deploy" — Railway will build and start your backend.
  Wait 2–3 minutes for the first deploy.

STEP 7 — Get your backend URL
  Click your web service → "Settings" → "Domains"
  Click "Generate Domain"
  You will get something like:
    https://aleyart-examai-pro-production.up.railway.app

  Test it: open that URL + /health in your browser
  You should see: { "status": "ok", "school": "ALEYART ACADEMY" }

  SAVE THIS URL — you need it for the frontend.

════════════════════════════════════════════════════
 PART 3 — DEPLOY FRONTEND ON VERCEL
════════════════════════════════════════════════════

STEP 1 — Create Vercel account
  Go to: https://vercel.com
  Click "Continue with GitHub" — use the same GitHub account

STEP 2 — Import your project
  Click "Add New..." → "Project"
  Find "aleyart-examai-pro" in the list → click "Import"

STEP 3 — Configure the project
  Framework Preset: Create React App (auto-detected)
  Root Directory:   frontend          ← IMPORTANT: change this!
  Build Command:    npm run build     (auto-filled)
  Output Directory: build             (auto-filled)

STEP 4 — Add environment variable
  Click "Environment Variables"
  Add:
    Name:  REACT_APP_API_URL
    Value: https://aleyart-examai-pro-production.up.railway.app/api
           ↑ Replace with YOUR Railway backend URL + /api

STEP 5 — Deploy
  Click "Deploy"
  Wait 1–2 minutes.
  Vercel gives you a URL like:
    https://aleyart-examai-pro.vercel.app

STEP 6 — Update Railway ALLOWED_ORIGINS
  Go back to Railway → your web service → Variables
  Update ALLOWED_ORIGINS to your exact Vercel URL:
    ALLOWED_ORIGINS = https://aleyart-examai-pro.vercel.app
  Railway redeploys automatically.

════════════════════════════════════════════════════
 PART 4 — TEST YOUR LIVE SYSTEM
════════════════════════════════════════════════════

1. Open your Vercel URL: https://aleyart-examai-pro.vercel.app
2. Login with:
   Email:    admin@aleyartacademy.edu.gh
   Password: Admin@2025!
3. Go to Settings → change the admin password immediately!
4. Try generating an exam with AI — it should work end-to-end.

════════════════════════════════════════════════════
 PART 5 — CUSTOM DOMAIN (optional, free with Vercel)
════════════════════════════════════════════════════

If you have a domain like aleyartacademy.edu.gh:

On Vercel:
  Project → Settings → Domains → Add Domain
  Type: app.aleyartacademy.edu.gh
  Vercel shows you DNS records to add.

On your domain registrar (GoDaddy, Namecheap, etc.):
  Add a CNAME record:
    Name:  app
    Value: cname.vercel-dns.com

Wait 5–30 minutes for DNS to propagate. Done!

════════════════════════════════════════════════════
 TROUBLESHOOTING
════════════════════════════════════════════════════

PROBLEM: Railway deploy fails with "prisma not found"
  FIX: Make sure Root Directory is set to "backend" in Railway settings
       and Build Command includes: npm install && npx prisma generate

PROBLEM: Frontend says "Network Error" or "Cannot connect to API"
  FIX: Check REACT_APP_API_URL in Vercel — must end with /api
       Check ALLOWED_ORIGINS in Railway — must match your Vercel URL exactly
       Check Railway backend is running (green dot in Railway dashboard)

PROBLEM: Login fails with "Invalid credentials"
  FIX: The seed ran during deploy. Check Railway logs for "🎉 Seeding complete!"
       If you don't see it, go to Railway → your service → "Deploy" tab
       → click the latest deploy → view build logs

PROBLEM: AI generation fails
  FIX: Check ANTHROPIC_API_KEY is set correctly in Railway Variables
       Must start with sk-ant- and have no extra spaces

PROBLEM: Railway says "Out of free credits"
  FIX: Add a payment method to Railway (you won't be charged unless
       you exceed $5/month which is very unlikely for a school system)
  OR:  Switch to Render.com — see render.yaml in the project root

════════════════════════════════════════════════════
 ALTERNATIVE: RENDER.COM (also free)
════════════════════════════════════════════════════

If Railway doesn't work, use Render.com:

1. Go to https://render.com → sign in with GitHub
2. Click "New" → "Blueprint"
3. Connect your GitHub repo
4. Render reads the render.yaml file automatically
5. Add your ANTHROPIC_API_KEY when prompted
6. Click "Apply" — Render deploys everything

Note: Render free tier spins down after 15 min inactivity.
First request after sleep takes ~30 seconds to wake up.
Railway does not have this limitation.

════════════════════════════════════════════════════
 URLS SUMMARY (fill in as you deploy)
════════════════════════════════════════════════════

GitHub Repo:      https://github.com/___/aleyart-examai-pro
Railway Backend:  https://_____________________.railway.app
Vercel Frontend:  https://aleyart-examai-pro.vercel.app
Custom Domain:    https://app.aleyartacademy.edu.gh (optional)

Admin Login:      admin@aleyartacademy.edu.gh / Admin@2025!
                  ⚠️ Change password after first login!

════════════════════════════════════════════════════
ALEYART ACADEMY — Seeking Wisdom
ExamAI Pro v2.0 | it@aleyartacademy.edu.gh
════════════════════════════════════════════════════
