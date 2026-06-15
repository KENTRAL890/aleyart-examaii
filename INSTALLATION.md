# ALEYART EXAMAI PRO — Complete Installation & Deployment Guide
# School: ALEYART ACADEMY | Motto: SEEKING WISDOM
# Version: 2.0.0 | Last Updated: June 2025

────────────────────────────────────────────────────────────────────────────────
 TABLE OF CONTENTS
────────────────────────────────────────────────────────────────────────────────
 1. System Requirements
 2. Project Structure
 3. Quick Start (Docker — Recommended)
 4. Manual Installation
 5. Environment Variables Reference
 6. Database Setup
 7. First Login & Setup
 8. Production Deployment (Ubuntu VPS)
 9. SSL / HTTPS Setup
10. Backup & Recovery
11. Troubleshooting
12. Updating the System
────────────────────────────────────────────────────────────────────────────────


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. SYSTEM REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Minimum (Development):
  CPU:    2 vCPU
  RAM:    2 GB
  Disk:   20 GB SSD
  OS:     Ubuntu 22.04 LTS / macOS 12+ / Windows 11

Recommended (Production):
  CPU:    4 vCPU
  RAM:    4 GB
  Disk:   40 GB SSD
  OS:     Ubuntu 22.04 LTS

Software Prerequisites:
  - Node.js 20 LTS       https://nodejs.org
  - MySQL 8.0            https://mysql.com
  - Docker 24+           https://docker.com
  - Docker Compose 2.x   https://docs.docker.com/compose
  - Git                  https://git-scm.com

API Keys Required:
  - Anthropic API Key    https://console.anthropic.com
    (Used for AI exam generation, marking scheme generation)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 2. PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

aleyart-examai-pro/
│
├── README.md                    # Project overview
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Contribution guidelines
├── SECURITY.md                  # Security policy
├── LICENSE                      # MIT License
├── docker-compose.yml           # Full-stack Docker Compose
├── ecosystem.config.js          # PM2 process manager config
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # GitHub Actions CI/CD pipeline
│
├── backend/                     # Node.js + Express API
│   ├── Dockerfile               # Multi-stage production Docker image
│   ├── package.json
│   ├── .env.example             # Environment variables template
│   └── src/
│       ├── server.js            # Express app entry point
│       ├── routes/
│       │   └── index.js         # All API route definitions
│       ├── controllers/
│       │   ├── authController.js        # Login, register, JWT
│       │   ├── examinationController.js # Exam CRUD + AI generation
│       │   ├── dataController.js        # Students, teachers, results
│       │   └── exportController.js      # DOCX, XLSX export endpoints
│       ├── middleware/
│       │   ├── auth.js          # JWT authentication + RBAC
│       │   ├── errorHandler.js  # Global error handler
│       │   └── rateLimiter.js   # Rate limiting (API, auth, AI)
│       └── services/
│           ├── aiService.js     # Anthropic Claude integration
│           └── exportService.js # DOCX + XLSX generation
│
├── frontend/                    # React 18 SPA
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js               # Root component + routing
│       ├── index.js             # React entry point
│       ├── api/
│       │   └── client.js        # Axios API client with interceptors
│       ├── context/
│       │   └── AuthContext.js   # Global auth state
│       ├── utils/
│       │   ├── curriculum.js    # Ghana curriculum constants
│       │   └── printUtils.js    # PDF generation (jsPDF)
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── ExamGenerator.jsx
│           ├── Repository.jsx
│           ├── MarkingSchemes.jsx
│           ├── OMRSheets.jsx
│           ├── AnswerBooklets.jsx
│           ├── QuestionBank.jsx
│           ├── Students.jsx
│           ├── Teachers.jsx
│           ├── Results.jsx
│           └── Settings.jsx
│
├── prisma/
│   ├── schema.prisma            # Complete MySQL 8 database schema
│   └── seed.js                  # Initial data seed
│
├── docker/
│   └── nginx/
│       └── aleyart.conf         # Nginx reverse proxy config
│
└── scripts/
    └── deploy.sh                # Ubuntu server deployment script


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 3. QUICK START — DOCKER (RECOMMENDED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Clone the repository
  git clone https://github.com/aleyart-academy/examai-pro.git
  cd examai-pro

Step 2: Configure environment variables
  cp backend/.env.example .env
  nano .env

  REQUIRED settings to change:
    DATABASE_URL       — already set for Docker (don't change hostname)
    JWT_SECRET         — generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    JWT_REFRESH_SECRET — generate another random 64-byte hex string
    ANTHROPIC_API_KEY  — get from https://console.anthropic.com
    ADMIN_PASSWORD     — choose a strong password

Step 3: Start all services
  docker compose up -d

Step 4: Verify everything is running
  docker compose ps
  curl http://localhost:5000/health

Step 5: Access the application
  Frontend:  http://localhost (or your server IP)
  API:       http://localhost:5000/api
  Health:    http://localhost:5000/health

That's it! The database is automatically migrated and seeded on first run.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 4. MANUAL INSTALLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4.1 Database Setup
  ─────────────────
  Connect to MySQL as root:
    mysql -u root -p

  Run these SQL commands:
    CREATE DATABASE aleyart_examai
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci;

    CREATE USER 'aleyart_user'@'localhost'
      IDENTIFIED BY 'YourStrongPassword123!';

    GRANT ALL PRIVILEGES ON aleyart_examai.*
      TO 'aleyart_user'@'localhost';

    FLUSH PRIVILEGES;
    EXIT;

4.2 Backend Setup
  ─────────────────
  cd backend
  npm install

  # Configure environment
  cp .env.example .env
  nano .env   # Fill in all required values

  # Generate Prisma client
  npx prisma generate

  # Run database migrations
  npx prisma migrate deploy

  # Seed initial data (classes, subjects, default admin user)
  node prisma/seed.js

  # Start in development mode
  npm run dev

  # OR start in production mode
  npm start

4.3 Frontend Setup
  ──────────────────
  cd frontend
  npm install

  # Create environment file
  echo "REACT_APP_API_URL=/api" > .env.local

  # Development
  npm start

  # Production build
  npm run build
  # Build output: frontend/build/

4.4 Serve Frontend (Production)
  ──────────────────────────────
  Option A: Nginx (recommended)
    Copy frontend/build/* to /usr/share/nginx/html/
    Use the nginx config in docker/nginx/aleyart.conf

  Option B: Express static serving
    The backend already serves the frontend build in production mode.
    Set NODE_ENV=production and the backend will serve frontend/build/

4.5 PM2 Process Manager (Production)
  ─────────────────────────────────────
  npm install -g pm2

  # Start with PM2
  pm2 start ecosystem.config.js --env production

  # Save process list (auto-restart on reboot)
  pm2 save
  pm2 startup   # Follow the instructions printed

  # Monitor
  pm2 status
  pm2 logs aleyart-api


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 5. ENVIRONMENT VARIABLES REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Variable              Required   Description
─────────────────────────────────────────────────────────────────────────────
NODE_ENV              Yes        production | development | test
PORT                  No         API server port (default: 5000)
DATABASE_URL          Yes        MySQL connection string
JWT_SECRET            Yes        64+ char secret for access tokens
JWT_REFRESH_SECRET    Yes        64+ char secret for refresh tokens
JWT_EXPIRES_IN        No         Access token expiry (default: 24h)
ANTHROPIC_API_KEY     Yes        Your Anthropic API key (sk-ant-...)
ALLOWED_ORIGINS       Yes        Comma-separated list of allowed CORS origins
UPLOAD_DIR            No         Path for file uploads (default: ./uploads)
ADMIN_PASSWORD        No         Initial admin password for seed (default: Admin@2025!)
MYSQL_ROOT_PASSWORD   Docker     MySQL root password (Docker only)
MYSQL_PASSWORD        Docker     MySQL user password (Docker only)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 6. FIRST LOGIN & SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Default login credentials (created by seed.js):

  Role            Email                              Password
  ─────────────────────────────────────────────────────────────────
  Administrator   admin@aleyartacademy.edu.gh        Admin@2025!
  Headteacher     headteacher@aleyartacademy.edu.gh  Headteacher@2025!
  Teachers        [email]@aleyartacademy.edu.gh      Teacher@2025!

⚠️  IMPORTANT: Change ALL passwords immediately after first login!
    Go to: Settings → Change Password

First-time setup checklist:
  [ ] Login as Administrator
  [ ] Go to Settings → School Information
  [ ] Update school name, address, phone, email, website
  [ ] Upload the school logo
  [ ] Change the admin password
  [ ] Create additional teacher accounts (Settings → Users → Add User)
  [ ] Assign classes and subjects to teachers
  [ ] Enroll students (Students → Add Student)
  [ ] Test AI generation with a sample examination


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 7. PRODUCTION DEPLOYMENT — UBUNTU VPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supported providers: DigitalOcean, AWS EC2, Google Cloud, Azure, Hetzner

Step 1: Provision a server
  - Ubuntu 22.04 LTS
  - Minimum 2 vCPU, 2 GB RAM, 20 GB SSD
  - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

Step 2: Connect via SSH and run deployment script
  ssh user@your-server-ip
  git clone https://github.com/aleyart-academy/examai-pro.git
  cd examai-pro
  chmod +x scripts/deploy.sh
  ./scripts/deploy.sh

Step 3: Configure environment
  cp backend/.env.example /opt/aleyart-examai-pro/.env
  nano /opt/aleyart-examai-pro/.env
  # Fill in all required values

Step 4: Start the application
  cd /opt/aleyart-examai-pro
  docker compose up -d

Step 5: Verify
  curl http://localhost:5000/health
  docker compose ps


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 8. SSL / HTTPS SETUP (Let's Encrypt)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Requirements:
  - A registered domain (e.g. app.aleyartacademy.edu.gh)
  - DNS A record pointing to your server IP
  - Ports 80 and 443 open

Steps:
  # Install certbot
  sudo apt install certbot python3-certbot-nginx -y

  # Obtain certificate
  sudo certbot --nginx \
    -d app.aleyartacademy.edu.gh \
    --email it@aleyartacademy.edu.gh \
    --agree-tos \
    --non-interactive

  # Test auto-renewal
  sudo certbot renew --dry-run

Certificates are automatically renewed every 90 days.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 9. BACKUP & RECOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database Backup (run daily via cron):
  mysqldump -u aleyart_user -p aleyart_examai \
    | gzip > /backups/aleyart_$(date +%Y%m%d_%H%M%S).sql.gz

  Crontab entry (daily at 2 AM):
    0 2 * * * mysqldump -u aleyart_user -pPASSWORD aleyart_examai | gzip > /backups/aleyart_$(date +\%Y\%m\%d).sql.gz

Docker Volume Backup:
  docker run --rm \
    -v aleyart_mysql_data:/data \
    -v $(pwd)/backups:/backup \
    alpine tar czf /backup/mysql_data_$(date +%Y%m%d).tar.gz /data

Restore from Backup:
  gunzip < backup_file.sql.gz | mysql -u aleyart_user -p aleyart_examai


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROBLEM: Cannot connect to database
  CHECK:  docker compose ps  (is db service healthy?)
  FIX:    docker compose logs db
          Verify DATABASE_URL in .env matches docker-compose.yml credentials

PROBLEM: AI generation returns errors
  CHECK:  Is ANTHROPIC_API_KEY set correctly in .env?
  FIX:    curl -H "x-api-key: $ANTHROPIC_API_KEY" https://api.anthropic.com/v1/models

PROBLEM: Login fails with "Invalid credentials"
  CHECK:  Has the database been seeded?
  FIX:    docker compose exec api node prisma/seed.js

PROBLEM: Cannot access the application
  CHECK:  docker compose ps (all services running?)
          sudo ufw status (ports 80, 443 open?)
  FIX:    docker compose restart

PROBLEM: JWT token errors in browser console
  CHECK:  JWT_SECRET and JWT_REFRESH_SECRET are set in .env
  FIX:    docker compose restart api

PROBLEM: Uploads (logos, photos) not saving
  CHECK:  UPLOAD_DIR path exists and is writable
  FIX:    mkdir -p uploads && chmod 755 uploads

View logs:
  docker compose logs -f api         # API logs
  docker compose logs -f db          # Database logs
  docker compose logs -f nginx       # Nginx logs
  pm2 logs aleyart-api               # PM2 logs (non-Docker)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. UPDATING THE SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Via Docker (Recommended):
  cd /opt/aleyart-examai-pro
  git pull origin main
  docker compose pull
  docker compose up -d --build
  docker compose exec api npx prisma migrate deploy

Via PM2 (Manual):
  cd /opt/aleyart-examai-pro
  git pull origin main
  cd backend && npm install
  npx prisma migrate deploy
  pm2 restart aleyart-api
  cd ../frontend && npm install && npm run build

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ALEYART ACADEMY — Seeking Wisdom
 ExamAI Pro v2.0 | support: it@aleyartacademy.edu.gh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
