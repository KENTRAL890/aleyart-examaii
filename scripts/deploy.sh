#!/bin/bash
# ─── ALEYART EXAMAI PRO — Ubuntu Server Deployment Script ─────────────────────
# Tested on Ubuntu 22.04 LTS
# Usage: bash scripts/deploy.sh
# Run as a user with sudo privileges (NOT as root)

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[ALEYART]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log " ALEYART EXAMAI PRO — Deployment Script"
log " School: ALEYART ACADEMY | Motto: SEEKING WISDOM"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DEPLOY_DIR="/opt/aleyart-examai-pro"
APP_USER="aleyart"

# ─── CHECK PREREQUISITES ──────────────────────────────────────────────────────
[[ $EUID -eq 0 ]] && err "Do not run this script as root. Use a sudo-capable user."

# ─── SYSTEM UPDATE ────────────────────────────────────────────────────────────
log "Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# ─── INSTALL DEPENDENCIES ─────────────────────────────────────────────────────
log "Installing system dependencies..."
sudo apt-get install -y -qq \
  curl wget git unzip \
  nginx certbot python3-certbot-nginx \
  ufw fail2ban \
  build-essential

# ─── DOCKER ───────────────────────────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sudo bash
  sudo usermod -aG docker $USER
  log "Docker installed. You may need to log out and back in."
else
  log "Docker already installed: $(docker --version)"
fi

if ! command -v docker compose &> /dev/null; then
  log "Installing Docker Compose plugin..."
  sudo apt-get install -y docker-compose-plugin
fi

# ─── NODE.JS 20 ───────────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  log "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
  sudo apt-get install -y nodejs
else
  log "Node.js already installed: $(node --version)"
fi

# ─── PM2 ──────────────────────────────────────────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  log "Installing PM2..."
  sudo npm install -g pm2
  pm2 startup | tail -1 | sudo bash
fi

# ─── APPLICATION USER ────────────────────────────────────────────────────────
if ! id "$APP_USER" &>/dev/null; then
  log "Creating application user: $APP_USER"
  sudo useradd -m -s /bin/bash $APP_USER
  sudo usermod -aG docker $APP_USER
fi

# ─── DEPLOYMENT DIRECTORY ────────────────────────────────────────────────────
log "Setting up deployment directory: $DEPLOY_DIR"
sudo mkdir -p $DEPLOY_DIR
sudo chown $APP_USER:$APP_USER $DEPLOY_DIR
sudo chmod 755 $DEPLOY_DIR

# ─── FIREWALL ─────────────────────────────────────────────────────────────────
log "Configuring UFW firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# ─── FAIL2BAN ─────────────────────────────────────────────────────────────────
log "Configuring Fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# ─── ENV FILE CHECK ───────────────────────────────────────────────────────────
if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
  warn "No .env file found at $DEPLOY_DIR/.env"
  warn "Please create it from .env.example before continuing:"
  warn "  cp $DEPLOY_DIR/backend/.env.example $DEPLOY_DIR/.env"
  warn "  nano $DEPLOY_DIR/.env"
  warn "Then re-run: bash scripts/deploy.sh"
fi

# ─── START WITH DOCKER COMPOSE ───────────────────────────────────────────────
if [[ -f "$DEPLOY_DIR/.env" ]]; then
  log "Starting ALEYART EXAMAI PRO with Docker Compose..."
  cd $DEPLOY_DIR
  docker compose pull
  docker compose up -d
  log "Waiting for services to start..."
  sleep 20
  docker compose ps
fi

# ─── NGINX SITE CONFIG ────────────────────────────────────────────────────────
if [[ -f "$DEPLOY_DIR/docker/nginx/aleyart.conf" ]]; then
  log "Configuring Nginx..."
  sudo cp $DEPLOY_DIR/docker/nginx/aleyart.conf /etc/nginx/sites-available/aleyart
  sudo ln -sf /etc/nginx/sites-available/aleyart /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx
fi

# ─── SSL CERTIFICATE (Let's Encrypt) ─────────────────────────────────────────
read -p "Set up SSL certificate now? (y/n): " setup_ssl
if [[ "$setup_ssl" == "y" ]]; then
  read -p "Enter your domain (e.g. app.aleyartacademy.edu.gh): " DOMAIN
  read -p "Enter your email (for Let's Encrypt): " EMAIL
  sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
  sudo systemctl reload nginx
fi

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log " ✅ ALEYART EXAMAI PRO DEPLOYMENT COMPLETE"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log " API Health: http://localhost:5000/health"
log " Docker:     docker compose ps"
log " Logs:       docker compose logs -f api"
log ""
warn " IMPORTANT: Change all default passwords immediately!"
warn " Default admin: admin@aleyartacademy.edu.gh / Admin@2025!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
