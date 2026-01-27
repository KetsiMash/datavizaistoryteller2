import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Sigma,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useData } from '@/context/DataContext';
import { AnalysisType } from '@/types/analytics';
import { calculateStatistics, generateInsights, generateCharts, generateNarrative } from '@/lib/analytics';

const analysisTypes: { type: AnalysisType; label: string; icon: React.ElementType; description: string }[] = [
  { 
    type: 'descriptive', 
    label: 'Descriptive Statistics', 
    icon: Sigma,
    description: 'Mean, median, mode, variance, and distribution analysis'
  },
  { 
    type: 'correlation', 
    label: 'Correlation Analysis', 
    icon: Network,
    description: 'Discover relationships between variables'
  },
  { 
    type: 'trend', 
    label: 'Trend Analysis', 
    icon: TrendingUp,
    description: 'Identify patterns and trends over time'
  },
  { 
    type: 'clustering', 
    label: 'Clustering', 
    icon: PieChart,
    description: 'Group similar data points together'
  },
  { 
    type: 'regression', 
    label: 'Regression', 
    icon: GitBranch,
    description: 'Predict outcomes based on variables'
  },
  { 
    type: 'classification', 
    label: 'Classification', 
    icon: Sparkles,
    description: 'Categorize data into predefined classes'
  },
];

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { dataset, setAnalysisConfig, setStatistics, setInsights, setCharts, setNarrative } = useData();
  const [selectedType, setSelectedType] = useState<AnalysisType>('descriptive');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!dataset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Dataset Loaded</h2>
          <p className="text-muted-foreground mb-6">Please upload a dataset first.</p>
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

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const selectAllColumns = () => {
    if (selectedColumns.length === dataset.columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(dataset.columns.map(c => c.name));
    }
  };

  const runAnalysis = async () => {
    if (selectedColumns.length === 0) return;
    
    setIsProcessing(true);
    
    // Simulate processing time for effect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const stats = calculateStatistics(dataset, selectedColumns);
    const insights = generateInsights(dataset, stats);
    const charts = generateCharts(dataset, selectedColumns, selectedType);
    const narrative = generateNarrative(dataset, stats, insights);
    
    setAnalysisConfig({ type: selectedType, selectedColumns });
    setStatistics(stats);
    setInsights(insights);
    setCharts(charts);
    setNarrative(narrative);
    
    setIsProcessing(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DataViz AI</span>
          </Link>
          <Link to="/upload">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Upload
            </Button>
          </Link>
        </div>
      </nav>
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Configure Your <span className="gradient-text">Analysis</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Select analysis type and columns to include in your analysis.
            </p>
          </div>
          
          {/* Dataset Info */}
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Dataset</p>
                <p className="font-semibold">{dataset.name}</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-sm text-muted-foreground">Rows</p>
                <p className="font-semibold">{dataset.rowCount.toLocaleString()}</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-sm text-muted-foreground">Columns</p>
                <p className="font-semibold">{dataset.columns.length}</p>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Analysis Type */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Analysis Type</h2>
              <div className="grid gap-3">
                {analysisTypes.map((analysis) => (
                  <motion.button
                    key={analysis.type}
                    className={`glass-card p-4 text-left transition-all ${
                      selectedType === analysis.type 
                        ? 'border-primary ring-1 ring-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedType(analysis.type)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedType === analysis.type ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      }`}>
                        <analysis.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{analysis.label}</p>
                        <p className="text-sm text-muted-foreground">{analysis.description}</p>
                      </div>
                      {selectedType === analysis.type && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Column Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select Columns</h2>
                <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                  {selectedColumns.length === dataset.columns.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="glass-card p-4 max-h-[500px] overflow-y-auto">
                <div className="space-y-2">
                  {dataset.columns.map((column) => (
                    <div
                      key={column.name}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        selectedColumns.includes(column.name) 
                          ? 'bg-primary/10' 
                          : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => toggleColumn(column.name)}
                    >
                      <Checkbox
                        checked={selectedColumns.includes(column.name)}
                        onCheckedChange={() => toggleColumn(column.name)}
                      />
                      <div className="flex-1">
                        <p className="font-medium font-mono text-sm">{column.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            column.type === 'number' ? 'bg-chart-1/20 text-chart-1' :
                            column.type === 'string' ? 'bg-chart-2/20 text-chart-2' :
                            column.type === 'date' ? 'bg-chart-3/20 text-chart-3' :
                            'bg-chart-4/20 text-chart-4'
                          }`}>
                            {column.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {column.uniqueCount} unique
                          </span>
                          {column.nullCount > 0 && (
                            <span className="text-xs text-destructive">
                              {column.nullCount} nulls
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Run Analysis Button */}
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="btn-gradient text-lg px-8"
              onClick={runAnalysis}
              disabled={selectedColumns.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-5 h-5" />
                  Run Analysis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
            {selectedColumns.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Select at least one column to continue
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
