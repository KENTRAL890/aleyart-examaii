# SECURITY.md — ALEYART EXAMAI PRO

## Reporting Security Vulnerabilities

Please **do not** report security vulnerabilities through public GitHub Issues.

Email: it@aleyartacademy.edu.gh  
Subject: [SECURITY] ALEYART EXAMAI PRO Vulnerability Report

We will acknowledge your report within 48 hours and provide a resolution timeline.

## Security Features

- JWT access tokens (24h expiry) + refresh tokens (30d)
- bcrypt password hashing — 12 salt rounds
- Role-Based Access Control (RBAC) — 4 roles
- Rate limiting: 200 req/15min (API), 10 req/15min (auth), 5 req/min (AI)
- Helmet.js security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS whitelist — only approved origins
- Prisma ORM — SQL injection prevention
- All uploads validated for file type and size
- Audit log for all critical actions
- No sensitive data in JWT payloads
- Refresh token rotation on every use
- Automatic token invalidation on logout

## Production Hardening Checklist

- [ ] Change all default passwords immediately after first login
- [ ] Use strong, unique JWT_SECRET and JWT_REFRESH_SECRET (64+ chars)
- [ ] Enable HTTPS with a valid SSL certificate
- [ ] Configure firewall (UFW) — only ports 80, 443, 22
- [ ] Enable Fail2ban for SSH and Nginx
- [ ] Set ALLOWED_ORIGINS to your exact domain(s)
- [ ] Store .env securely — never commit to version control
- [ ] Enable MySQL binary logging for point-in-time recovery
- [ ] Schedule regular database backups
- [ ] Keep all dependencies updated (npm audit regularly)
- [ ] Monitor logs: /var/log/aleyart/
