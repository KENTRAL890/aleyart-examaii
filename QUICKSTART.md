# ALEYART EXAMAI PRO — Quick Start Guide
# ════════════════════════════════════════

## STEP 1 — Prerequisites
Make sure you have installed:
  - Node.js 18, 20, 22, or 24  →  https://nodejs.org
  - MySQL 8.0                   →  https://mysql.com  (or use Docker)
  - An Anthropic API key        →  https://console.anthropic.com

---

## STEP 2 — Create the MySQL database
Open MySQL Workbench or terminal and run:

  CREATE DATABASE aleyart_examai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'aleyart_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
  GRANT ALL PRIVILEGES ON aleyart_examai.* TO 'aleyart_user'@'localhost';
  FLUSH PRIVILEGES;

---

## STEP 3 — Configure environment variables
In the backend/ folder:

  cp .env.example .env

Then open .env and set these 4 required values:

  DATABASE_URL="mysql://aleyart_user:StrongPassword123!@localhost:3306/aleyart_examai"
  JWT_SECRET=paste-any-long-random-string-here-minimum-32-characters
  JWT_REFRESH_SECRET=paste-a-different-long-random-string-here
  ANTHROPIC_API_KEY=sk-ant-your-key-from-console.anthropic.com

  TIP — Generate secure JWT secrets instantly:
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  Run that twice and paste each result.

---

## STEP 4 — Install & set up the backend
In a terminal, cd into the backend/ folder:

  cd backend
  npm install
  npx prisma generate
  npx prisma migrate deploy
  node prisma/seed.js

You should see:
  ✅ School config seeded
  ✅ Classes seeded (14 classes)
  ✅ Subjects seeded (12 subjects)
  ✅ Teachers seeded
  ✅ Sample students seeded
  🎉 Seeding complete!

---

## STEP 5 — Start the backend
Still inside backend/:

  npm run dev

You should see the server banner:
  ╔════════════════════════════════════╗
  ║   ALEYART EXAMAI PRO — API SERVER  ║
  ║   Port: 5000                       ║
  ╚════════════════════════════════════╝

Test it:   http://localhost:5000/health

---

## STEP 6 — Start the frontend
Open a NEW terminal, cd into the frontend/ folder:

  cd frontend
  npm install
  npm start

This opens http://localhost:3000 automatically.

---

## STEP 7 — Log in
  URL:      http://localhost:3000
  Email:    admin@aleyartacademy.edu.gh
  Password: Admin@2025!

⚠️  Change your password immediately after first login!

---

## DEFAULT ACCOUNTS
  Role           Email                                 Password
  ─────────────────────────────────────────────────────────────────
  Administrator  admin@aleyartacademy.edu.gh           Admin@2025!
  Headteacher    headteacher@aleyartacademy.edu.gh     Headteacher@2025!
  All Teachers   [name]@aleyartacademy.edu.gh          Teacher@2025!

---

## COMMON ERRORS & FIXES

ERROR: "Missing required environment variables"
  → Open backend/.env and make sure DATABASE_URL, JWT_SECRET,
    JWT_REFRESH_SECRET are all set (not the placeholder text)

ERROR: "Can't reach database server"
  → Make sure MySQL is running:  sudo service mysql start
  → Check DATABASE_URL matches your MySQL username/password/port

ERROR: "prisma generate" fails
  → Run inside the backend/ folder (not the root folder)
  → Make sure you ran: npm install first

ERROR: "Table doesn't exist"
  → Run: npx prisma migrate deploy
  → Then: node prisma/seed.js

ERROR: Port 5000 already in use
  → Change PORT=5001 in backend/.env and restart

ERROR: AI generation fails / no questions generated
  → Check ANTHROPIC_API_KEY in backend/.env is correct
  → Make sure the key starts with: sk-ant-
  → The app still works without AI — it falls back to sample questions

---

## VS CODE TIPS
  - Install extension: "Prisma" by Prisma (syntax highlighting for schema.prisma)
  - Install extension: "DotENV" for .env file highlighting
  - Open the project as: File → Open Folder → select the "aleyart" folder
  - Split terminal: one for backend (npm run dev), one for frontend (npm start)

---

ALEYART ACADEMY — Seeking Wisdom
ExamAI Pro v2.0 · support: it@aleyartacademy.edu.gh
