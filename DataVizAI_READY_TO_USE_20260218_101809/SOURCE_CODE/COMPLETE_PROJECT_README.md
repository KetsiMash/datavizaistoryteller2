# Data Viz AI - Complete Source Code Project

## 🎯 What This Is

This is the COMPLETE, WORKING source code for Data Viz AI. Extract and run it - everything works out of the box!

## ✅ What's Included

- ✓ All React/TypeScript source code
- ✓ All components and pages
- ✓ Configuration files (Vite, TypeScript, Tailwind)
- ✓ Package.json with all dependencies
- ✓ Public assets (icons, images)
- ✓ Documentation files
- ✓ GitHub workflows
- ✓ Environment configuration

## 🚀 How to Run (4 Simple Steps)

### Step 1: Extract the ZIP
Extract all files to a folder of your choice

### Step 2: Open Terminal
- Windows: Right-click folder → "Open in Terminal" or use Command Prompt
- Mac/Linux: Open Terminal and `cd` to the folder

### Step 3: Install Dependencies
```bash
npm install
```
This will download all required packages (takes 2-3 minutes)

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open in Browser
The app will automatically open at: `http://localhost:8080`

## 📋 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Check code quality
```

## 🎨 Features That Work

✅ Upload CSV/Excel files
✅ Multiple file upload and merging
✅ Interactive charts (bar, line, pie, scatter, area)
✅ Data validation and quality checks
✅ AI-powered insights
✅ PDF report generation
✅ Voice assistant (demo mode)
✅ Dark mode
✅ Responsive design
✅ Expandable sidebar navigation
✅ Data preview tables
✅ Statistical analysis
✅ Correlation analysis
✅ Predictions panel

## 🔧 Requirements

- Node.js 18+ (download from https://nodejs.org)
- npm (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 📁 Project Structure

```
datavizaistoryteller/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities and services
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   └── types/          # TypeScript types
├── public/             # Static assets
├── dist/               # Build output (created after build)
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind CSS config
└── tsconfig.json       # TypeScript config
```

## 🌐 Deployment

### Deploy to GitHub Pages
```bash
npm run build
# Upload dist/ folder to GitHub repository
# Enable GitHub Pages in repository settings
```

### Deploy to Netlify
1. Drag and drop the entire folder to https://app.netlify.com/drop
2. Or connect your GitHub repository

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

## 🔑 Environment Variables (Optional)

For voice features with real API:
1. Create `.env` file in root
2. Add:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

Note: Voice features work in demo mode without these.

## 🐛 Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org

### "Cannot find module"
Run `npm install` again

### Port 8080 already in use
The app will automatically use a different port (8081, 8082, etc.)

### Build errors
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. Run `npm run dev`

### Blank page in browser
1. Check terminal for errors
2. Ensure `npm run dev` is running
3. Try `http://localhost:8080` directly
4. Clear browser cache

## 📝 Making Changes

1. Edit files in `src/` folder
2. Changes auto-reload in browser (hot reload)
3. No need to restart server

## 🎓 Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components
- Recharts for visualizations
- React Router for navigation
- Supabase (optional, for voice features)

## 📄 License

See LICENSE file

## 🆘 Support

If something doesn't work:
1. Check you have Node.js 18+ installed
2. Ensure `npm install` completed without errors
3. Check terminal for error messages
4. Try deleting `node_modules` and running `npm install` again

---

## ✨ Quick Test

After running `npm run dev`, you should see:
```
  VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open the Local URL in your browser - the app should load immediately!

---

Built with ❤️ - Ready to run, modify, and deploy!
