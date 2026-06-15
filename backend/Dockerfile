# ─── ALEYART EXAMAI PRO — Backend Dockerfile ─────────────────────────────────
# Multi-stage build: development → build → production

# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl curl
COPY package*.json ./
COPY prisma ./prisma/

# Stage 2: Development dependencies
FROM base AS deps
RUN npm ci

# Stage 3: Build (generate Prisma client)
FROM deps AS build
RUN npx prisma generate

# Stage 4: Production
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache openssl curl && \
    addgroup -S aleyart && \
    adduser -S aleyart -G aleyart

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY src ./src
COPY package*.json ./

RUN mkdir -p /app/uploads && chown -R aleyart:aleyart /app

USER aleyart

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node src/server.js"]
