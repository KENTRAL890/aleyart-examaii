# ALEYART EXAMAI PRO - Deployment Guide

## Overview
ALEYART EXAMAI PRO is a React-based web application that compiles to static files. This guide covers multiple deployment options.

---

## Quick Start - Local Build

The application has been built successfully. The production files are in the `dist/` folder.

```bash
# Build command (already completed)
npm run build

# Preview locally
npm run preview
```

---

## Deployment Options

### Option 1: Vercel (Recommended - Free)

**Steps:**
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Vercel auto-detects Vite - just click "Deploy"
5. Your app will be live at `https://your-project.vercel.app`

**Or deploy via CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

### Option 2: Netlify (Free)

**Steps:**
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Drag and drop the `dist/` folder to deploy instantly
3. Or connect your Git repository for automatic deployments

**Or deploy via CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

---

### Option 3: GitHub Pages (Free)

**Steps:**
1. Create a GitHub repository
2. Push your code to the repository
3. Go to Settings > Pages
4. Select "GitHub Actions" as the source
5. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

### Option 4: Firebase Hosting (Free tier available)

**Steps:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# When prompted:
# - Select "Use an existing project" or create new
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite dist/index.html: No

# Deploy
firebase deploy --only hosting
```

---

### Option 5: AWS S3 + CloudFront

**Steps:**
1. Create an S3 bucket with static website hosting enabled
2. Upload contents of `dist/` folder
3. Set bucket policy for public access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. (Optional) Create CloudFront distribution for HTTPS and caching

---

### Option 6: Traditional Web Hosting (cPanel, etc.)

**Steps:**
1. Build the project: `npm run build`
2. Upload all files from the `dist/` folder to your `public_html` directory
3. Ensure your server is configured to serve `index.html` for all routes

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Environment Variables (Optional)

If you need to configure API keys (e.g., OpenAI API for production):

1. Create a `.env.production` file:
```
VITE_OPENAI_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://your-api.com
```

2. Access in code:
```javascript
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
```

---

## Post-Deployment Checklist

- [ ] Test login functionality with all demo accounts
- [ ] Verify examination generation works
- [ ] Test print/export features
- [ ] Check responsive design on mobile devices
- [ ] Verify data persistence (localStorage)
- [ ] Test all navigation links

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@aleyart.edu.gh | admin123 |
| Headteacher | headteacher@aleyart.edu.gh | head123 |
| Exam Officer | exams@aleyart.edu.gh | exams123 |
| Teacher | teacher@aleyart.edu.gh | teacher123 |

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Site Settings > Domain Management
2. Add custom domain
3. Configure DNS records

### General DNS Settings
```
Type: A
Name: @
Value: [Your hosting provider's IP]

Type: CNAME
Name: www
Value: [Your app URL]
```

---

## Troubleshooting

### Blank page after deployment
- Ensure base URL is correct in `vite.config.ts`
- Check browser console for errors
- Verify all files were uploaded

### Routes not working (404 errors)
- Configure server to redirect all requests to `index.html`
- Use the `.htaccess` or nginx config above

### Assets not loading
- Check that asset paths are relative
- Verify CORS settings if using external APIs

---

## Support

For issues with ALEYART EXAMAI PRO:
- Check browser console for errors
- Verify all dependencies are installed
- Ensure Node.js version 18+ is used

---

## Production Considerations

For a full production deployment with backend:

1. **Database**: Set up MySQL database
2. **Backend**: Deploy Laravel API separately
3. **Authentication**: Configure proper JWT/session handling
4. **File Storage**: Set up cloud storage for uploads
5. **SSL**: Ensure HTTPS is enabled
6. **Backups**: Configure automated database backups

---

*ALEYART ACADEMY - SEEKING WISDOM*
*AI-Powered Examination Management System*
*Compliant with GES, NaCCA, SBC & CCP Standards*
