#!/bin/bash

# eCommerce Dashboard - Quick Publish Script
# This script helps you publish your system to get a public URL

set -e

echo "🚀 eCommerce Dashboard - Quick Publish"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo ""
    echo -e "${YELLOW}⚠️  No GitHub remote found${NC}"
    echo ""
    echo "Please create a GitHub repository first:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository (e.g., 'ecommerce-dashboard')"
    echo "3. Copy the repository URL"
    echo ""
    read -p "Enter your GitHub repository URL: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo -e "${RED}❌ No URL provided. Exiting.${NC}"
        exit 1
    fi
    
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote added${NC}"
fi

# Add all files
echo ""
echo -e "${YELLOW}📝 Adding files to git...${NC}"
git add .

# Commit
echo ""
read -p "Enter commit message (default: 'Prepare for deployment'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Prepare for deployment"}

git commit -m "$COMMIT_MSG" || echo "No changes to commit"

# Push
echo ""
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push -u origin main || git push -u origin master

echo ""
echo -e "${GREEN}✅ Code pushed to GitHub!${NC}"
echo ""
echo "======================================"
echo -e "${GREEN}🎉 Next Steps:${NC}"
echo "======================================"
echo ""
echo "1. Go to https://railway.app/"
echo "2. Click 'Login with GitHub'"
echo "3. Click 'New Project'"
echo "4. Select 'Deploy from GitHub repo'"
echo "5. Choose your repository"
echo "6. Wait for deployment (~3 minutes)"
echo "7. Click 'Generate Domain'"
echo "8. Copy your URL: https://yourapp.railway.app"
echo ""
echo "======================================"
echo -e "${GREEN}📖 Detailed Guide:${NC}"
echo "======================================"
echo ""
echo "Read: RAILWAY-DEPLOYMENT.md"
echo ""
echo -e "${GREEN}🔗 Your public URL will be:${NC}"
echo "https://yourapp.railway.app"
echo ""
echo -e "${GREEN}Use this URL sa Shopify integration!${NC}"
echo ""
