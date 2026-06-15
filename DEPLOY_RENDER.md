# ALEYART EXAMAI PRO — Deploy FREE on Render.com
# ═══════════════════════════════════════════════
# No credit card. No payment. 100% Free.
# 
# What you get FREE on Render:
#   ✅ Node.js backend (Web Service)
#   ✅ PostgreSQL database (90 days free, then $7/mo)
#   ✅ Static site for frontend (free forever)
#   ✅ Custom domain support
#   ✅ Auto-deploy from GitHub
#
# NOTE: Free tier sleeps after 15 min inactivity.
# First visit after sleep takes ~30 seconds to wake.
# Upgrade to $7/mo to keep it always-on.
# ═══════════════════════════════════════════════


════════════════════════════════════════════════════
 BEFORE YOU START — Push code to GitHub
════════════════════════════════════════════════════

If you haven't pushed to GitHub yet, do this first
in VS Code terminal (inside your aleyart folder):

  git init
  git add .
  git commit -m "ALEYART EXAMAI PRO v2.0"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/aleyart-examai-pro.git
  git push -u origin main

Replace YOUR_USERNAME with your GitHub username.


════════════════════════════════════════════════════
 PART 1 — CREATE DATABASE ON RENDER (PostgreSQL)
════════════════════════════════════════════════════

Render's free database is PostgreSQL, not MySQL.
The code has already been updated to support both.

STEP 1 — Sign up / log in
  Go to: https://render.com
  Click "Get Started for Free"
  Sign in with GitHub (same account as your code)

STEP 2 — Create the database
  Click "New +" → "PostgreSQL"

  Fill in:
    Name:         aleyart-db
    Database:     aleyart_examai
    User:         aleyart_user
    Region:       Choose closest to Ghana
                  (Oregon or Frankfurt)
    Plan:         Free

  Click "Create Database"

STEP 3 — Copy the connection string
  Wait ~1 minute for the database to be ready.
  On the database page, find:
    "Internal Database URL"  ← copy this entire string
  It looks like:
    postgresql://aleyart_user:xxxx@dpg-xxxx.oregon-postgres.render.com/aleyart_examai

  SAVE THIS — you need it in Part 2.


════════════════════════════════════════════════════
 PART 2 — DEPLOY BACKEND (Web Service)
════════════════════════════════════════════════════

STEP 1 — Create Web Service
  Click "New +" → "Web Service"
  Connect your GitHub repo: aleyart-examai-pro
  Click "Connect"

STEP 2 — Configure the service
  Fill in these fields:

  Name:             aleyart-examai-api
  Region:           Same as your database
  Branch:           main
  Root Directory:   backend
  Runtime:          Node
  Build Command:    npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js
  Start Command:    node src/server.js
  Plan:             Free

STEP 3 — Add Environment Variables
  Scroll down to "Environment Variables"
  Click "Add Environment Variable" for each:

  Key                   Value
  ─────────────────────────────────────────────────────────
  NODE_ENV              production
  PORT                  10000
  DATABASE_URL          [paste Internal Database URL from Part 1]
  JWT_SECRET            [generate below ↓]
  JWT_REFRESH_SECRET    [generate below ↓]
  ANTHROPIC_API_KEY     [your sk-ant-... key]
  ALLOWED_ORIGINS       https://aleyart-examai-pro.onrender.com
  ADMIN_PASSWORD        Admin@2025!

  HOW TO GENERATE JWT SECRETS:
  Open VS Code terminal and run:
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  Run it TWICE — paste first result as JWT_SECRET,
  second result as JWT_REFRESH_SECRET.

STEP 4 — Deploy
  Click "Create Web Service"
  Render will start building. Takes 3-5 minutes.
  Watch the build logs at the bottom of the page.

  You should see in the logs:
    ✅ School config seeded
    ✅ Classes seeded (14 classes)
    ✅ Subjects seeded (12 subjects)
    ✅ Teachers seeded
    🎉 Seeding complete!
    ALEYART EXAMAI PRO — API SERVER
    Port: 10000

STEP 5 — Get your backend URL
  At the top of your web service page you will see:
    https://aleyart-examai-api.onrender.com

  Test it — open in browser:
    https://aleyart-examai-api.onrender.com/health

  You should see:
    {"status":"ok","school":"ALEYART ACADEMY","motto":"SEEKING WISDOM"}

  SAVE THIS URL — needed for Part 3.


════════════════════════════════════════════════════
 PART 3 — DEPLOY FRONTEND (Static Site on Render)
════════════════════════════════════════════════════

STEP 1 — Create Static Site
  Click "New +" → "Static Site"
  Connect same GitHub repo: aleyart-examai-pro
  Click "Connect"

STEP 2 — Configure
  Name:             aleyart-examai-pro
  Branch:           main
  Root Directory:   frontend
  Build Command:    npm install && npm run build
  Publish Directory: build

STEP 3 — Add Environment Variable
  Click "Advanced" → "Add Environment Variable"

  Key:    REACT_APP_API_URL
  Value:  https://aleyart-examai-api.onrender.com/api

  Replace "aleyart-examai-api" with your actual
  Render backend service name if different.

STEP 4 — Deploy
  Click "Create Static Site"
  Takes 2-3 minutes to build.

STEP 5 — Get your frontend URL
    https://aleyart-examai-pro.onrender.com

  Open it in your browser — you should see the
  ALEYART ACADEMY login page!

STEP 6 — Update ALLOWED_ORIGINS in backend
  Go to your backend Web Service → Environment
  Update ALLOWED_ORIGINS to your exact frontend URL:
    ALLOWED_ORIGINS = https://aleyart-examai-pro.onrender.com

  Click "Save Changes" — Render redeploys automatically.


════════════════════════════════════════════════════
 PART 4 — LOG IN AND TEST
════════════════════════════════════════════════════

  URL:      https://aleyart-examai-pro.onrender.com
  Email:    admin@aleyartacademy.edu.gh
  Password: Admin@2025!

  After logging in:
  1. Go to Settings → Change admin password immediately
  2. Go to ✨ Generate Exam (AI) → test AI generation
  3. Go to 👥 Students → add some students
  4. Go to 📂 Repository → see the shared exam store


════════════════════════════════════════════════════
 ALSO DEPLOY FRONTEND ON VERCEL (faster + better)
════════════════════════════════════════════════════

Vercel is better for the frontend than Render
(no sleep, faster CDN, free forever).
Use Render for backend, Vercel for frontend.

  1. Go to: https://vercel.com
  2. Sign in with GitHub
  3. "Add New" → "Project"
  4. Import: aleyart-examai-pro
  5. Root Directory: frontend
  6. Add environment variable:
       REACT_APP_API_URL = https://aleyart-examai-api.onrender.com/api
  7. Click Deploy

  Your frontend URL will be:
    https://aleyart-examai-pro.vercel.app

  Then update ALLOWED_ORIGINS in Render backend to:
    https://aleyart-examai-pro.vercel.app


════════════════════════════════════════════════════
 TROUBLESHOOTING
════════════════════════════════════════════════════

PROBLEM: Build fails — "prisma: command not found"
  FIX: Make sure Build Command is exactly:
    npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js
  The "npx" prefix is required.

PROBLEM: Build fails — "DATABASE_URL must start with postgresql://"
  FIX: You are using the External URL instead of Internal URL.
       Go to your Render database → copy "Internal Database URL"
       Update DATABASE_URL in your web service environment variables.

PROBLEM: Login fails — "Invalid credentials"
  FIX: Seed didn't run. Check build logs for "🎉 Seeding complete!"
       If missing, add this to your start command temporarily:
         node prisma/seed.js && node src/server.js
       Then remove it after seeding is done.

PROBLEM: Frontend shows blank page
  FIX: Check REACT_APP_API_URL — must include /api at the end
       Must match your exact Render backend URL.
       Redeploy the frontend after fixing.

PROBLEM: "Network Error" when logging in
  FIX: Backend is sleeping (free tier).
       Wait 30 seconds and try again.
       The first request wakes it up.

PROBLEM: AI generation fails
  FIX: Check ANTHROPIC_API_KEY in Render environment variables.
       Must start with sk-ant-
       No spaces before or after the key.

PROBLEM: Database says "connection refused" after 90 days
  FIX: Render's free PostgreSQL expires after 90 days.
       Upgrade to $7/mo OR export data and create a new free DB.
       (Your $5 Render free credit covers this for months)


════════════════════════════════════════════════════
 YOUR LIVE URLS (fill in as you deploy)
════════════════════════════════════════════════════

  Database:         [Render PostgreSQL — internal only]
  Backend API:      https://aleyart-examai-api.onrender.com
  Frontend:         https://aleyart-examai-pro.onrender.com
     OR on Vercel:  https://aleyart-examai-pro.vercel.app
  Health Check:     https://aleyart-examai-api.onrender.com/health

  Admin login:      admin@aleyartacademy.edu.gh
  Admin password:   Admin@2025!  ← CHANGE THIS FIRST!


════════════════════════════════════════════════════
ALEYART ACADEMY — Seeking Wisdom
ExamAI Pro v2.0
════════════════════════════════════════════════════
