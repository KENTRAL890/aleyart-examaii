// src/server.js — ALEYART EXAMAI PRO Backend
// Node.js 20/22/24 + Express + Prisma + MySQL 8
require('dotenv').config();

// Validate required env vars before anything else
const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error('\n❌ Missing required environment variables:');
  missing.forEach(k => console.error(`   - ${k}`));
  console.error('\n📋 Copy backend/.env.example to backend/.env and fill in the values.\n');
  process.exit(1);
}

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const compression = require('compression');
const path        = require('path');

const routes               = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter }       = require('./middleware/rateLimiter');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── SECURITY ─────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      scriptSrc:  ["'self'"],
      imgSrc:     ["'self'", 'data:', 'blob:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, mobile apps, etc.)
    if (!origin || ALLOWED.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ─── GENERAL MIDDLEWARE ───────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── STATIC UPLOADS ───────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', etag: true }));

// ─── RATE LIMIT ───────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'ALEYART EXAMAI PRO API',
    version:   '2.0.0',
    school:    'ALEYART ACADEMY',
    motto:     'SEEKING WISDOM',
    node:      process.version,
    timestamp: new Date().toISOString(),
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── SERVE REACT FRONTEND (production) ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '../../frontend/build');
  app.use(express.static(frontendBuild));
  app.get('*', (_req, res) => res.sendFile(path.join(frontendBuild, 'index.html')));
}

// ─── ERROR HANDLERS ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n[EXAMAI PRO] ${signal} received — shutting down gracefully`);
  try {
    const prisma = require('./utils/prisma');
    await prisma.$disconnect();
  } catch (_) {}
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║        ALEYART EXAMAI PRO — API SERVER            ║
║        School:  ALEYART ACADEMY                   ║
║        Motto:   SEEKING WISDOM                    ║
╠═══════════════════════════════════════════════════╣
║  Port:    ${String(PORT).padEnd(5)}                                 ║
║  Mode:    ${(process.env.NODE_ENV||'development').padEnd(11)}                      ║
║  Node:    ${process.version.padEnd(8)}                             ║
║  API:     http://localhost:${PORT}/api               ║
║  Health:  http://localhost:${PORT}/health            ║
╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
