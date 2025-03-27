#!/bin/bash

# Script to prepare the SkinHive Coming Soon page for GitHub

echo "Preparing SkinHive Coming Soon page for GitHub..."
echo "================================================="

# Remove any Netlify-specific files
if [ -d "netlify" ]; then
  echo "Removing Netlify directory..."
  rm -rf netlify
fi

if [ -f "netlify.toml" ]; then
  echo "Removing netlify.toml..."
  rm -f netlify.toml
fi

# Remove .git directory if it exists (user will initialize their own repo)
if [ -d ".git" ]; then
  echo "Removing existing .git directory..."
  rm -rf .git
fi

# Remove any temporary files
echo "Removing temporary files..."
find . -name "*.tmp" -type f -delete
find . -name "*.temp" -type f -delete
find . -name "*.bak" -type f -delete

# Ensure scripts are executable
chmod +x deploy.sh

echo "Creating a clean Git repository..."
git init
git add .
git commit -m "Initial commit of SkinHive Coming Soon page"

echo "================================================="
echo "Preparation complete! Your folder is now ready to be pushed to GitHub."
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add your GitHub repository as remote:"
echo "   git remote add origin https://github.com/yourusername/your-repo-name.git"
echo "3. Push your code:"
echo "   git push -u origin main"
echo "4. Connect the repository to AWS Amplify Console and deploy"
echo "=================================================" 