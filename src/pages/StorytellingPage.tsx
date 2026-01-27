import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  ArrowLeft,
  BookOpen,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';


export default function StorytellingPage() {
  const { dataset, narrative } = useData();

  if (!dataset || !narrative) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Story Generated</h2>
          <p className="text-muted-foreground mb-6">Please run an analysis first.</p>
          <Link to="/upload">
            <Button className="btn-gradient">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Go to Upload
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const downloadReport = () => {
    const blob = new Blob([narrative], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name.replace(/\.[^/.]+$/, '')}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DataViz AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Button size="sm" className="btn-gradient" onClick={downloadReport}>
              <Download className="mr-2 w-4 h-4" />
              Download Report
            </Button>
          </div>
        </div>
      </nav>
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Data <span className="gradient-text">Story</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              A narrative summary of your data analysis for non-technical audiences.
            </p>
          </div>
          
          {/* Narrative Content */}
          <motion.div 
            className="glass-card p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">AI-Generated Report</span>
            </div>
            
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="space-y-4 text-foreground">
                {narrative.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={i} className="text-2xl font-bold gradient-text mt-8 mb-4">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('### ')) {
                    return (
                      <h3 key={i} className="text-xl font-semibold mt-6 mb-3">
                        {line.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex items-start gap-3 ml-4">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{
                          __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                        }} />
                      </div>
                    );
                  }
                  if (line.match(/^\d+\. /)) {
                    return (
                      <div key={i} className="flex items-start gap-3 ml-4">
                        <span className="text-primary font-semibold">{line.match(/^\d+/)?.[0]}.</span>
                        <p className="text-muted-foreground">{line.replace(/^\d+\. /, '')}</p>
                      </div>
                    );
                  }
                  if (line.trim()) {
                    return (
                      <p key={i} className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{
                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                      }} />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
