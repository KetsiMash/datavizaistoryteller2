# Data Viz AI - Static Deployment Package

This folder contains the complete built version of Data Viz AI that can be deployed anywhere or opened directly in a browser.

## What's Inside

- `index.html` - Main entry point (open this in Chrome)
- `assets/` - All JavaScript, CSS, images, and icons
- `favicon.*` - App icons
- `.nojekyll` - Ensures proper deployment on GitHub Pages
- `404.html` - Handles routing for single-page app

## How to Use

### Option 1: Open Locally in Chrome
1. Navigate to this folder
2. Double-click `index.html` or right-click → Open with → Chrome
3. The app will open in your browser

### Option 2: Deploy to GitHub Pages
1. Create a new repository on GitHub
2. Upload all files from this folder to the repository
3. Go to Settings → Pages
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click Save
7. Your site will be live at: `https://yourusername.github.io/repository-name/`

### Option 3: Deploy to Netlify
1. Go to https://app.netlify.com/drop
2. Drag and drop this entire folder
3. Your site will be live instantly with a random URL
4. You can customize the URL in site settings

### Option 4: Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to this folder in terminal
3. Run: `vercel`
4. Follow the prompts
5. Your site will be deployed

### Option 5: Deploy to Any Web Server
1. Upload all files to your web server's public directory
2. Ensure the server serves `index.html` for all routes
3. Access via your domain

## Features Included

✅ Data upload (CSV, Excel)
✅ Interactive charts and visualizations
✅ AI-powered insights
✅ Data validation
✅ PDF report generation
✅ Voice assistant (requires API keys)
✅ Responsive design
✅ Dark mode support

## Configuration

### Environment Variables (Optional)
If you need to configure API keys for voice features:
1. Create a `.env` file in your deployment
2. Add: `VITE_SUPABASE_URL=your_url`
3. Add: `VITE_SUPABASE_ANON_KEY=your_key`

Note: Voice features work in demo mode without API keys.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## File Structure

```
dist/
├── index.html              # Main HTML file
├── 404.html               # Routing fallback
├── .nojekyll              # GitHub Pages config
├── favicon.ico            # App icon
├── favicon.png            # App icon (PNG)
├── favicon.png.webp       # App icon (WebP)
├── placeholder.svg        # Placeholder image
├── robots.txt             # SEO configuration
├── assets/                # All compiled assets
│   ├── index-*.css       # Styles
│   ├── index-*.js        # Application code
│   └── *.js              # Dependencies
└── DEPLOYMENT_README.md   # This file
```

## Troubleshooting

### Blank Page
- Check browser console for errors (F12)
- Ensure all files are uploaded
- Check that `.nojekyll` file exists (for GitHub Pages)

### 404 Errors
- Ensure `404.html` is present
- For custom servers, configure to serve `index.html` for all routes

### Features Not Working
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser
- Clear browser cache

## Support

For issues or questions:
- Check the main project README
- Review browser console errors
- Ensure all files are present and accessible

## License

See LICENSE file in the main project repository.

---

Built with ❤️ using React, TypeScript, and Vite
