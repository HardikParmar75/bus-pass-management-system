#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Bus Pass Management System - Setup Info${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Find IP address
echo -e "${YELLOW}Finding your machine's IP address...${NC}"
IP=$(ipconfig getifaddr en0)

if [ -z "$IP" ]; then
    echo -e "${YELLOW}Could not find IP on en0, trying en1...${NC}"
    IP=$(ipconfig getifaddr en1)
fi

if [ ! -z "$IP" ]; then
    echo -e "${GREEN}✓ Your IP Address: $IP${NC}"
    echo ""
    echo -e "${BLUE}To access from your phone:${NC}"
    echo ""
    echo -e "${YELLOW}1. Update your .env files:${NC}"
    echo -e "   frontend/.env:"
    echo -e "${GREEN}   VITE_API_URL=http://$IP:8000${NC}"
    echo ""
    echo -e "   user-frontend/.env:"
    echo -e "${GREEN}   VITE_API_URL=http://$IP:8000${NC}"
    echo ""
    echo -e "${YELLOW}2. Make sure backend is running:${NC}"
    echo -e "${GREEN}   cd backend && nodemon${NC}"
    echo ""
    echo -e "${YELLOW}3. Start frontends:${NC}"
    echo -e "${GREEN}   cd frontend && npm run dev${NC}"
    echo -e "${GREEN}   cd user-frontend && npm run dev${NC}"
    echo ""
    echo -e "${YELLOW}4. On your phone, visit:${NC}"
    echo -e "${GREEN}   Admin: http://$IP:5173${NC}"
    echo -e "${GREEN}   User: http://$IP:5174${NC}"
    echo ""
else
    echo -e "${YELLOW}Could not find IP address automatically.${NC}"
    echo -e "${YELLOW}Run: ipconfig getifaddr en0${NC}"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}For more help, see: PHONE_ACCESS_SETUP.md${NC}"
echo -e "${BLUE}========================================${NC}"
