#!/bin/bash
# setup.sh - Quick setup script for Secret Mission Online

echo "╔════════════════════════════════════════════╗"
echo "║   Secret Mission Online - Setup Script     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }
print_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_err() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check Node.js
if ! command -v node &> /dev/null; then
  print_err "Node.js tidak ditemukan! Install dari https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -v)
print_ok "Node.js: $NODE_VER"

# Backend setup
print_step "Install backend dependencies..."
cd backend
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  print_ok "File .env backend dibuat dari .env.example"
fi
cd ..

# Frontend setup
print_step "Install frontend dependencies..."
cd frontend
npm install
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  print_ok "File .env.local frontend dibuat dari .env.example"
fi
cd ..

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup selesai! Cara menjalankan:          ${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "  Buka: http://localhost:3000"
echo ""
