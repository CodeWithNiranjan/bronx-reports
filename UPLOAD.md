# Step-by-Step Deployment Guide for Bronx Community Reports

This guide will walk you through the entire process of deploying the Bronx Community Reports application to GitHub and GitHub Pages.

## Step 1: Initial Setup

### 1.1 Install Required Software
First, ensure you have all necessary software installed:

1. **Node.js and npm**
   - Visit https://nodejs.org/
   - Download and install the LTS version
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Git**
   - Visit https://git-scm.com/downloads
   - Download and install for your operating system
   - Verify installation:
     ```bash
     git --version
     ```

### 1.2 Configure Git
Set up your Git identity:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 1.3 Create .gitignore
Create a `.gitignore` file in your project root:
```bash
# Create the file
touch .gitignore
```

Add the following content:
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor files
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Backend specific
backend/data/
backend/uploads/
```

## Step 2: GitHub Repository Setup

### 2.1 Create New Repository
1. Go to GitHub.com and sign in
2. Click the "+" icon in the top right
3. Select "New repository"
4. Fill in the details:
   - Repository name: `bronx-reports`
   - Description: "A community reporting platform for Bronx residents"
   - Visibility: Public
   - Initialize with: None
5. Click "Create repository"

### 2.2 Initialize Local Repository
```bash
# Navigate to your project directory
cd bronx-reports

# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Bronx Community Reports"

# Add remote repository
git remote add origin https://github.com/yourusername/bronx-reports.git

# Push to GitHub
git push -u origin main
```

## Step 3: Frontend Preparation

### 3.1 Update package.json
Navigate to the frontend directory:
```bash
cd frontend
```

Edit `package.json` to add GitHub Pages configuration:
```json
{
  "homepage": "https://yourusername.github.io/bronx-reports",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### 3.2 Install Dependencies
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Install other dependencies
npm install
```

### 3.3 Configure Environment Variables
Create `.env.production`:
```bash
# Create the file
touch .env.production
```

Add the following content:
```
REACT_APP_API_URL=https://your-backend-url.com
```

## Step 4: Backend Deployment

### 4.1 Choose a Hosting Platform
We'll use Heroku for this example:

1. **Install Heroku CLI**
   ```bash
   # For Windows
   npm install -g heroku

   # For macOS
   brew tap heroku/brew && brew install heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   # Create new app
   heroku create bronx-reports-api

   # Add PostgreSQL
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set PORT=5000
   ```

5. **Deploy to Heroku**
   ```bash
   # Add Heroku remote
   heroku git:remote -a bronx-reports-api

   # Push to Heroku
   git push heroku main
   ```

## Step 5: Frontend Deployment

### 5.1 Build and Deploy
```bash
# Navigate to frontend directory
cd frontend

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### 5.2 Verify Deployment
1. Visit `https://yourusername.github.io/bronx-reports`
2. Test the following features:
   - Report submission
   - Map functionality
   - Image uploads
   - Admin panel

## Step 6: Post-Deployment Setup

### 6.1 Set up GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install Dependencies
        run: |
          cd frontend
          npm install
          
      - name: Build
        run: |
          cd frontend
          npm run build
          
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: frontend/build
```

### 6.2 Security Setup
1. Enable HTTPS
2. Configure CORS
3. Set up rate limiting
4. Secure environment variables

## Step 7: Maintenance

### 7.1 Regular Tasks
1. Update dependencies:
   ```bash
   npm update
   ```

2. Monitor error logs
3. Backup database
4. Check performance metrics

### 7.2 Backup Strategy
1. Database backups
2. File storage backups
3. Configuration backups

## Troubleshooting Guide

### Common Issues and Solutions

1. **Build Failures**
   ```bash
   # Clear npm cache
   npm cache clean --force

   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

2. **Deployment Issues**
   - Check GitHub Pages settings
   - Verify build output
   - Check deployment logs

3. **API Connection Issues**
   - Verify backend URL
   - Check CORS configuration
   - Test API endpoints

4. **Image Upload Problems**
   - Check file size limits
   - Verify storage configuration
   - Test upload permissions

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Heroku Documentation](https://devcenter.heroku.com)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment)
- [Node.js Documentation](https://nodejs.org/docs)

## Support

If you encounter any issues:
1. Check the troubleshooting guide
2. Review deployment logs
3. Open an issue on GitHub
4. Contact support if needed 