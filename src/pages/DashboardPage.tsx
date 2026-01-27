import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowLeft,
  Download,
  Lightbulb,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataPreviewTable } from '@/components/dashboard/DataPreviewTable';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DashboardPage() {
  const { dataset, statistics, charts, analysisConfig } = useData();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    
    setIsExporting(true);
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your dashboard export...",
    });

    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${dataset?.name || 'dashboard'}-report.pdf`);

      toast({
        title: "Export Complete",
        description: "Your dashboard has been exported as PDF.",
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!dataset || !analysisConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Analysis Results</h2>
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

  const numericStats = statistics.filter(s => s.mean !== undefined);

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DataViz AI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/insights">
              <Button variant="outline" size="sm">
                <Lightbulb className="mr-2 w-4 h-4" />
                View Insights
              </Button>
            </Link>
            <Link to="/storytelling">
              <Button variant="outline" size="sm">
                <BookOpen className="mr-2 w-4 h-4" />
                Data Story
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="btn-gradient" 
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <Download className="mr-2 w-4 h-4" />
              )}
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </nav>
      
      <div ref={dashboardRef} className="relative z-10 container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="gradient-text">{dataset.name}</span> Dashboard
            </h1>
            <p className="text-muted-foreground">
              {analysisConfig.type.charAt(0).toUpperCase() + analysisConfig.type.slice(1)} analysis • 
              {dataset.rowCount.toLocaleString()} rows • 
              {analysisConfig.selectedColumns.length} columns analyzed
            </p>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total Records"
              value={dataset.rowCount.toLocaleString()}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={{ value: 100, isPositive: true }}
            />
            <KPICard
              title="Columns Analyzed"
              value={analysisConfig.selectedColumns.length.toString()}
              icon={<BarChart3 className="w-5 h-5" />}
            />
            {numericStats.slice(0, 2).map((stat, i) => (
              <KPICard
                key={stat.column}
                title={`Avg ${stat.column}`}
                value={stat.mean?.toLocaleString() || 'N/A'}
                icon={<TrendingUp className="w-5 h-5" />}
                trend={{ 
                  value: stat.std ? Number((stat.std / (stat.mean || 1) * 100).toFixed(1)) : 0, 
                  isPositive: true 
                }}
              />
            ))}
          </div>
          
          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {charts.slice(0, 4).map((chart, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ChartCard chart={chart} />
              </motion.div>
            ))}
          </div>
          
          {/* Data Preview */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
            <DataPreviewTable 
              data={dataset.rows.slice(0, 10)} 
              columns={analysisConfig.selectedColumns}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
