# DataViz AI - Intelligent Data Analytics Platform

Transform your data into actionable insights with AI-powered analytics, beautiful visualizations, and intelligent storytelling.

## 🚀 Features

### Core Analytics
- **Smart Data Import**: Upload CSV, Excel, JSON, or TXT files with automatic column detection
- **AI-Powered Insights**: Machine learning algorithms reveal hidden patterns and opportunities
- **Interactive Dashboards**: Real-time charts, KPIs, and statistical analysis
- **Data Validation**: Comprehensive accuracy checking and quality assessment
- **Voice Analytics**: Audio narration of insights and data stories

### Advanced Capabilities
- **Statistical Analysis**: Correlation analysis, distribution testing, trend identification
- **Predictive Analytics**: AI-generated predictions and recommendations
- **Data Storytelling**: Automated narrative generation from your data
- **PDF Reports**: Comprehensive exportable reports with visualizations
- **Multi-format Support**: CSV, XLSX, XLS, JSON, TXT file compatibility

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion for smooth interactions
- **Backend**: Supabase for data processing and AI integration
- **Voice**: Web Speech API for audio features
- **PDF Generation**: jsPDF for report exports

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd dataviz-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🎯 Usage Guide

### Getting Started
1. **Upload Data**: Drag and drop your data file or click to browse
2. **Configure Analysis**: Select columns and analysis type
3. **View Dashboard**: Explore interactive charts and KPIs
4. **Generate Insights**: Let AI analyze patterns and trends
5. **Export Reports**: Download comprehensive PDF reports

### Supported File Formats
- **CSV**: Comma-separated values
- **XLSX/XLS**: Microsoft Excel files
- **JSON**: JavaScript Object Notation
- **TXT**: Tab or custom delimited text files

### Key Features
- **Data Validation**: Real-time accuracy checking
- **Voice Narration**: Audio explanations of insights
- **Interactive Charts**: Hover for detailed information
- **Statistical Testing**: Hypothesis testing and distribution analysis
- **Correlation Analysis**: Identify relationships between variables

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── ui/            # Base UI components (shadcn/ui)
│   └── AppSidebar.tsx # Navigation sidebar
├── context/            # React context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and services
├── pages/             # Application pages/routes
├── types/             # TypeScript type definitions
└── integrations/      # External service integrations
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Vitest**: Unit testing framework

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Other Platforms
The built application in the `dist/` folder can be deployed to any static hosting service:
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- DigitalOcean App Platform

## 🔐 Environment Variables

Required environment variables for full functionality:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Features (Supabase Edge Functions)
OPENAI_API_KEY=your_openai_api_key
```

## 📊 Features Overview

### Data Analysis
- Descriptive statistics (mean, median, mode, standard deviation)
- Distribution analysis with skewness and kurtosis
- Correlation matrices and scatter plots
- Trend analysis and forecasting
- Outlier detection and handling

### Visualizations
- Bar charts, line charts, pie charts
- Scatter plots with regression lines
- Histograms and distribution plots
- KPI cards and metric displays
- Interactive tooltips and legends

### AI Capabilities
- Pattern recognition in data
- Automated insight generation
- Predictive analytics and forecasting
- Natural language explanations
- Voice narration of findings

## 🎨 Design System

Built with a modern, professional design system:
- **Colors**: Deep slate theme with teal/cyan accents
- **Typography**: Inter font family with clear hierarchy
- **Components**: Consistent shadcn/ui component library
- **Animations**: Smooth Framer Motion transitions
- **Responsive**: Mobile-first responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Moeketsi Mashigo**  
AI Engineer  
📱 073 555 0431  
🌐 Transform data into decisions

## 🆘 Support

For support and questions:
1. Check the documentation above
2. Review the code comments and examples
3. Open an issue on GitHub
4. Contact the development team

---

**DataViz AI** - Empowering data-driven decisions through intelligent analytics and beautiful visualizations.
