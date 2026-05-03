# GitHub Pages Deployment Setup Guide

## Quick Setup

### Option 1: Automatic Deployment with GitHub Actions (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lux-trade-learn.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings: `https://github.com/YOUR_USERNAME/lux-trade-learn/settings/pages`
   - Under "Build and deployment":
     - Source: Select "GitHub Actions"
     - This will automatically use the `.github/workflows/deploy.yml` workflow

3. **Deploy**
   - The GitHub Actions workflow will run automatically on push to `main`
   - Your site will be available at: `https://YOUR_USERNAME.github.io/lux-trade-learn/`
   - Or if you set a custom domain (CNAME), it will be available there

### Option 2: Manual Deployment (if not using GitHub Actions)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Push to `gh-pages` branch**
   ```bash
   git subtree push --prefix dist/client origin gh-pages
   ```

3. **Enable GitHub Pages**
   - Go to Settings > Pages
   - Source: Select `gh-pages` branch
   - Folder: Select `/ (root)`

## Custom Domain Setup

If deploying to a custom domain (like `trademasteryai.com`):

1. **Update the workflow file**
   - Edit `.github/workflows/deploy.yml`
   - The `cname: trademasteryai.com` line will automatically create a CNAME file

2. **Configure DNS**
   - Add these DNS records at your domain registrar:
     - CNAME record pointing to `YOUR_USERNAME.github.io`
     - Or use GitHub's IP addresses (check GitHub Pages docs for current IPs)

3. **Wait for DNS propagation** (can take 24 hours)

## Project-Specific URL Setup

### For `username.github.io/lux-trade-learn/` (Project Site)

- The workflow is pre-configured for this
- Site will be available at that URL automatically
- Internal links should work thanks to the 404.html redirect

### For `username.github.io/` (User/Org Site)

If deploying to a user/org site:

1. Rename repository to `YOUR_USERNAME.github.io`
2. Update `.github/workflows/deploy.yml`:
   - Remove or comment out the `cname` line
   - Or update it to your domain if using a custom domain

## Troubleshooting

### 404 Errors on Page Refresh

- ✅ Fixed by the `public/404.html` file
- The file redirects non-existent URLs to `index.html` so the SPA router can handle them

### Files Not Updating

- Clear your browser cache: `Ctrl+Shift+Delete`
- Check that the workflow ran successfully in the "Actions" tab
- Verify the `dist/client` folder contains your latest build

### Custom Domain Not Working

- Check DNS settings are correct
- Verify CNAME file was created in the deployment
- Wait for DNS propagation (can take 24 hours)
- Clear browser cache

## File Structure After Deployment

```
your-repo/
├── .github/workflows/
│   └── deploy.yml         # ← GitHub Actions workflow
├── public/
│   ├── 404.html           # ← SPA redirect handler
│   ├── .nojekyll          # ← Disables Jekyll processing
│   ├── robots.txt         # ← SEO robots file
│   └── sitemap.xml        # ← SEO sitemap
├── src/
├── dist/                  # ← Generated during build
│   ├── client/            # ← Deployed to GitHub Pages
│   └── server/
└── package.json
```

## Verifying Deployment

1. Check GitHub Actions: `https://github.com/YOUR_USERNAME/lux-trade-learn/actions`
2. Look for the "Deploy to GitHub Pages" workflow
3. Once complete (green checkmark), visit your site URL
4. Test routing: visit `https://your-site/tools`, `https://your-site/learn`, etc.

## Notes

- The workflow deploys only `dist/client` folder (the static build)
- `.nojekyll` prevents GitHub from processing the site with Jekyll
- `404.html` handles all 404s and redirects to the SPA entry point
- All routes are handled client-side by React Router

For more info: https://docs.github.com/en/pages
