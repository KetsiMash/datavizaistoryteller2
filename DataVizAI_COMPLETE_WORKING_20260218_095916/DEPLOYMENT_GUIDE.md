# GitHub Pages Deployment Guide

## 🚀 Your DataViz AI is Ready to Deploy!

Your application has been configured for automatic deployment to GitHub Pages using GitHub Actions.

## 📋 Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your GitHub repository: https://github.com/KetsiMash/datavizaistoryteller2
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar under "Code and automation")
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Click **Save**

### Step 2: Enable GitHub Actions

1. In your repository, go to the **Actions** tab
2. If prompted, click **"I understand my workflows, go ahead and enable them"**
3. The deployment workflow will automatically run

### Step 3: Wait for Deployment

The deployment process will:
1. ✅ Install dependencies
2. ✅ Build your application
3. ✅ Deploy to GitHub Pages
4. ⏱️ Takes approximately 2-3 minutes

### Step 4: Access Your Live Site

Once deployed, your site will be available at:

**🌐 https://ketsimash.github.io/datavizaistoryteller2/**

## 🔄 Automatic Deployments

Every time you push to the `main` branch, GitHub Actions will automatically:
- Build your application
- Deploy the latest version to GitHub Pages
- Update your live site

## 📊 Monitoring Deployments

### Check Deployment Status

1. Go to the **Actions** tab in your repository
2. Click on the latest workflow run
3. Monitor the build and deploy progress
4. Green checkmark ✅ = Successfully deployed
5. Red X ❌ = Deployment failed (check logs)

### View Deployment Logs

1. Click on any workflow run
2. Click on **build** or **deploy** job
3. Expand steps to see detailed logs
4. Troubleshoot any errors

## 🛠️ Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build the application
npm run build

# The built files will be in the dist/ folder
# You can manually upload these to any hosting service
```

## 🔧 Configuration Files

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Push to main branch or manual trigger
- **Steps**: Install → Build → Deploy

### Vite Configuration
- **File**: `vite.config.ts`
- **Base URL**: `/datavizaistoryteller2/` (for GitHub Pages)
- **Build Output**: `dist/` folder

### Package.json
- **Deploy Script**: `npm run deploy`
- **Build Script**: `npm run build`

## 🌍 Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add DNS records as instructed by GitHub
4. Wait for DNS propagation (up to 24 hours)

### DNS Configuration Example
```
Type: CNAME
Name: www
Value: ketsimash.github.io
```

## 🔒 Environment Variables

For production deployment with environment variables:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (for Supabase functions)

### Update Workflow to Use Secrets

Edit `.github/workflows/deploy.yml` and add to the build step:

```yaml
- name: Build
  run: npm run build
  env:
    NODE_ENV: production
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## 📱 Testing Your Deployment

After deployment, test these features:

- ✅ Homepage loads correctly
- ✅ Navigation works (sidebar menu)
- ✅ File upload functionality
- ✅ Dashboard displays charts
- ✅ All pages are accessible
- ✅ Responsive design on mobile
- ✅ Voice features (if configured)

## 🐛 Troubleshooting

### Deployment Failed

**Check the Actions tab for error messages:**

1. **Build errors**: Fix TypeScript/ESLint errors in your code
2. **Permission errors**: Ensure GitHub Actions has write permissions
3. **Dependency errors**: Run `npm install` locally to verify

### Site Not Loading

1. **Check GitHub Pages settings**: Ensure source is set to "GitHub Actions"
2. **Wait for DNS**: Initial deployment may take a few minutes
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
4. **Check base URL**: Ensure vite.config.ts has correct base path

### 404 Errors on Routes

If you get 404 errors when navigating:

1. Add a `404.html` file that redirects to `index.html`
2. Or use hash-based routing instead of browser routing

## 🎉 Success Checklist

- [x] GitHub Actions workflow created
- [x] Vite config updated with base URL
- [x] .nojekyll file added
- [x] Changes committed and pushed
- [ ] GitHub Pages enabled in repository settings
- [ ] Deployment workflow completed successfully
- [ ] Site accessible at GitHub Pages URL
- [ ] All features working correctly

## 📞 Support

If you encounter issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review the [GitHub Pages documentation](https://docs.github.com/en/pages)
3. Check the workflow logs for specific errors
4. Ensure all dependencies are correctly installed

---

**Your DataViz AI application is now configured for deployment!**

Visit your repository's Actions tab to monitor the deployment process.
