import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Upload, 
  Sparkles, 
  TrendingUp, 
  PieChart, 
  ArrowRight,
  Database,
  Zap,
  LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Upload,
    title: 'Smart Data Import',
    description: 'Upload CSV, Excel, JSON, or TXT files with automatic column detection and type inference.',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Interactive charts and graphs generated automatically based on your data patterns.',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    description: 'Machine learning-powered insights reveal hidden patterns and business opportunities.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Analysis',
    description: 'Identify trends, correlations, and anomalies with statistical analysis tools.',
  },
];

const stats = [
  { value: '10M+', label: 'Rows Processed' },
  { value: '50+', label: 'Chart Types' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<1s', label: 'Avg Response' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DataViz AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/upload" className="text-muted-foreground hover:text-foreground transition-colors">
              Upload
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/insights" className="text-muted-foreground hover:text-foreground transition-colors">
              Insights
            </Link>
          </div>
          
          <Link to="/upload">
            <Button className="btn-gradient">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Analytics Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Data into{' '}
            <span className="gradient-text">Actionable Insights</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Upload your data, let AI analyze patterns, and generate beautiful 
            dashboards with intelligent storytelling—all in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/upload">
              <Button size="lg" className="btn-gradient text-lg px-8 py-6">
                <Upload className="mr-2 w-5 h-5" />
                Upload Your Data
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-border hover:bg-secondary">
                <PieChart className="mr-2 w-5 h-5" />
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Stats */}
        <motion.div 
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>
      
      {/* Features */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for{' '}
            <span className="gradient-text">Data Excellence</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional-grade analytics tools powered by AI, designed for teams of all sizes.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="glass-card p-6 hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* CTA */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div 
          className="glass-card p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50" />
          <div className="relative z-10">
            <Database className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Unlock Your Data's Potential?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start analyzing your data in minutes. No credit card required.
            </p>
            <Link to="/upload">
              <Button size="lg" className="btn-gradient text-lg px-8">
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary" />
            <span className="font-semibold">DataViz AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 DataViz AI. Transform data into decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
