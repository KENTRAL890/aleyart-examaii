# 🏫 ALEYART EXAMAI PRO

> **AI-Powered Examination Management System for ALEYART ACADEMY**
> *Motto: SEEKING WISDOM*

[![CI/CD](https://github.com/aleyart-academy/examai-pro/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/aleyart-academy/examai-pro/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://mysql.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://prisma.io)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [User Roles](#user-roles)
- [Educational Levels](#educational-levels)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Overview

**ALEYART EXAMAI PRO** is a complete, production-ready, AI-powered examination management system built exclusively for **ALEYART ACADEMY** and deployable in any Ghanaian school. It fully complies with:

- 🇬🇭 **Ghana Education Service (GES)** standards
- 📚 **National Council for Curriculum and Assessment (NaCCA)**
- 🎓 **Standards-Based Curriculum (SBC)**
- 🔗 **Common Core Programme (CCP)**

### What It Does

| Feature | Description |
|---|---|
| 🤖 AI Exam Generation | Claude AI generates curriculum-compliant questions instantly |
| ✅ Marking Schemes | Exact correct answers with full step-by-step solutions |
| 🔵 OMR Sheets | Printable optical mark recognition answer sheets |
| 📓 Answer Booklets | School-branded, lined, graph paper booklets |
| 🗂️ Question Bank | Permanent, searchable, shared question repository |
| 👥 Student Management | Full student records with parent/guardian info |
| 👨‍🏫 Teacher Management | Staff records with class/subject assignments |
| 📊 Results & Reports | GES-compliant grading, positions, class reports |
| 📤 Exports | PDF, DOCX, XLSX for all documents |
| 🖨️ Print-Ready | Professional A4 exam paper layout |

---

## Features

### 🤖 AI-Powered Generation
- Generates **all question types**: MCQ (A–D), Fill-in-blank, True/False, Matching, Short Answer, Essay, Theory, Practical, Comprehension, Summary, Composition, Case Study, Problem Solving
- **Special curriculum rules** automatically applied:
  - Computing, Science, Career Technology, Creative Arts: Q1 must be Practical
  - RME: Q1 must be story/scenario-based (70% rule enforced)
  - English JHS: Grammar, Comprehension, Summary, Composition, Literature structure
- **Never generates "suggested answers"** — always exact correct answers with full working

### 📄 Document Generation
- **Exam Papers**: Two-column Section A (MCQ) with vertical divider, single-column Section B
- **Marking Schemes**: Complete solutions, step-by-step working, marks breakdown
- **OMR Sheets**: Interactive bubble sheets with candidate fields
- **Answer Booklets**: Standard, Lined, Graph Paper, School-Branded

### 🏫 School Branding
Every document automatically displays:
```
ALEYART ACADEMY
Motto: SEEKING WISDOM
[School Logo] | [Address] | [Phone] | [Email] | [Website]
Academic Year | Term | Class | Subject | Teacher | Duration | Total Marks
```

### 🔐 Security
- JWT authentication with refresh tokens
- Role-Based Access Control (RBAC)
- bcrypt password hashing (12 rounds)
- Rate limiting on all endpoints
- Helmet security headers
- SQL injection prevention via Prisma ORM

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 18 | UI Framework |
| React Router | 6 | Navigation |
| Axios | 1.x | HTTP Client |
| jsPDF | 2.x | PDF Export |
| SheetJS (xlsx) | 0.x | Excel Export |
| docx | 8.x | Word Export |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express.js | 4.x | Web Framework |
| Prisma ORM | 5.x | Database ORM |
| MySQL | 8.0 | Database |
| Anthropic SDK | 0.30 | AI Engine |
| bcryptjs | 2.x | Password Hashing |
| jsonwebtoken | 9.x | JWT Auth |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerisation |
| Nginx | Reverse Proxy + SSL |
| PM2 | Process Management |
| GitHub Actions | CI/CD Pipeline |
| Let's Encrypt | SSL Certificates |

---

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- Docker & Docker Compose (for containerised deployment)
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Option A — Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/aleyart-academy/examai-pro.git
cd examai-pro

# 2. Configure environment
cp backend/.env.example .env
nano .env  # Fill in your values (especially ANTHROPIC_API_KEY and JWT secrets)

# 3. Start all services
docker compose up -d

# 4. Verify
curl http://localhost:5000/health
```

### Option B — Manual Setup

```bash
# 1. Clone & install
git clone https://github.com/aleyart-academy/examai-pro.git
cd examai-pro/backend
npm install

# 2. Configure
cp .env.example .env
nano .env

# 3. Database
npx prisma migrate deploy
node prisma/seed.js

# 4. Start
npm run dev  # development
npm start    # production

# 5. Frontend (separate terminal)
cd ../frontend
npm install
npm start    # development
npm run build # production build
```

---

## Installation

### Detailed Installation Guide

#### 1. Clone the Repository

```bash
git clone https://github.com/aleyart-academy/examai-pro.git
cd examai-pro
```

#### 2. Database Setup (MySQL 8)

```sql
-- Connect to MySQL as root
CREATE DATABASE aleyart_examai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aleyart_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON aleyart_examai.* TO 'aleyart_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
```

#### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local: REACT_APP_API_URL=http://localhost:5000/api
npm run build
```

#### 5. Start Services

```bash
# Development
cd backend && npm run dev

# Production with PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

---

## Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL="mysql://aleyart_user:PASSWORD@localhost:3306/aleyart_examai"

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-64-byte-hex-string
JWT_REFRESH_SECRET=your-other-64-byte-hex-string

# AI Engine
ANTHROPIC_API_KEY=sk-ant-your-key-here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://app.aleyartacademy.edu.gh
```

See [backend/.env.example](backend/.env.example) for all options.

---

## User Roles

| Role | Permissions |
|---|---|
| **Administrator** | Full access to all modules including user management, school config |
| **Headteacher** | View, approve, print, and export all examinations; view reports |
| **Examination Officer** | Create, edit, manage, print, export examinations and repository |
| **Teacher** | Create, save, edit, print, export own examinations; access shared repository |

### Default Credentials (change after first login!)

| Role | Email | Password |
|---|---|---|
| Administrator | admin@aleyartacademy.edu.gh | Admin@2025! |
| Headteacher | headteacher@aleyartacademy.edu.gh | Headteacher@2025! |
| Teachers | [email]@aleyartacademy.edu.gh | Teacher@2025! |

---

## Educational Levels

| Level | Classes | Examinations |
|---|---|---|
| Early Childhood | Creche, Nursery 1–2, KG1–2 | **No formal exams** — observation-based only |
| Primary | Basic 1–6 | All standard examination types |
| Junior High School | Basic 7–9 | All types including BECE Mock |

### Subjects

**Basic 1–6:** English Language, Mathematics, Science, Computing, Creative Arts, RME, History, French, GA/TWI

**Basic 7–9:** English Language, Mathematics, Science, Computing, Creative Arts and Design, RME, Social Studies, Career Technology, French, GA/TWI

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@aleyartacademy.edu.gh",
  "password": "Admin@2025!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "fullName": "...", "role": "admin" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/examinations` | List all shared exams |
| `POST` | `/api/examinations/generate` | AI-generate exam |
| `GET` | `/api/examinations/:uuid` | Get exam with questions |
| `PUT` | `/api/examinations/:uuid/approve` | Approve exam |
| `POST` | `/api/examinations/:uuid/duplicate` | Duplicate exam |
| `GET` | `/api/questions` | Question bank search |
| `GET` | `/api/students` | List students |
| `POST` | `/api/students` | Add student |
| `GET` | `/api/teachers` | List teachers |
| `GET` | `/api/results` | Get results |
| `POST` | `/api/results` | Save result |
| `GET` | `/api/school/config` | School settings |
| `PUT` | `/api/school/config` | Update school settings |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |

### AI Exam Generation

```http
POST /api/examinations/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "academicYear": "2024/2025",
  "term": "Term3",
  "cls": "Basic 7",
  "classId": 12,
  "subject": "Mathematics",
  "subjectId": 2,
  "examType": "End of Term Examination",
  "duration": 60,
  "totalMarks": 100,
  "difficulty": "Mixed",
  "topics": "Number Theory, Algebra, Geometry, Statistics",
  "numMCQ": 20,
  "numSubjective": 5
}
```

---

## Deployment

### Docker Compose (Production)

```bash
# Copy and configure environment
cp backend/.env.example .env
nano .env   # Set all required values

# Deploy
docker compose up -d

# Check status
docker compose ps
docker compose logs -f api

# Run migrations
docker compose exec api npx prisma migrate deploy
```

### Ubuntu Server (VPS / Cloud VM)

```bash
# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Supported Cloud Platforms
- DigitalOcean Droplet
- AWS EC2 (Ubuntu 22.04)
- Google Cloud Compute Engine
- Azure Virtual Machine
- Railway
- Render

### SSL Setup (Let's Encrypt)

```bash
sudo certbot --nginx -d app.aleyartacademy.edu.gh \
  --email your@email.com --agree-tos --non-interactive
```

---

## Shared Repository

A key feature of ALEYART EXAMAI PRO is the **school-wide shared repository**. When any authorised user saves an examination, question, or marking scheme, it is **immediately visible to all other authorised users** upon login — no manual sharing required.

Every saved item displays:
- Created By (teacher name + staff ID)
- Date Created
- Last Modified By
- Last Modified Date

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Security

See [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Support

- 📧 Email: it@aleyartacademy.edu.gh
- 🌐 Website: www.aleyartacademy.edu.gh
- 📍 Address: ALEYART ACADEMY, Accra, Ghana

---

*ALEYART ACADEMY — Seeking Wisdom*
*ExamAI Pro v2.0 — Built with ❤️ for Ghanaian education*
