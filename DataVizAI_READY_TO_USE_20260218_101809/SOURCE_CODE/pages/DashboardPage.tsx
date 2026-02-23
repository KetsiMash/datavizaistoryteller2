import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowLeft,
  Lightbulb,
  BookOpen,
  Loader2,
  Settings2,
  FileText,
  Brain,
  Volume2,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useData } from '@/context/DataContext';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartWithExplanation } from '@/components/dashboard/ChartWithExplanation';
import { ChartSelector } from '@/components/dashboard/ChartSelector';
import { DataPreviewTable } from '@/components/dashboard/DataPreviewTable';
import { PredictionsPanel } from '@/components/dashboard/PredictionsPanel';
import { DataValidationPanel } from '@/components/dashboard/DataValidationPanel';
import { VoicePlayer } from '@/components/VoicePlayer';
import { toast } from '@/hooks/use-toast';
import { generateComprehensivePDFReport } from '@/lib/pdfReportGenerator';
import { generateActionableInsights, generateMarketTrendInsights } from '@/lib/insightGenerator';
import { DataValidator } from '@/lib/dataValidation';
import { supabase } from '@/integrations/supabase/client';

interface PredictionData {
  predictions: Array<{
    title: string;
    prediction: string;
    confidence: 'high' | 'medium' | 'low';
    timeframe: 'short-term' | 'medium-term' | 'long-term';
    basedOn: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    expectedImpact: string;
    implementation: string;
  }>;
  riskFactors: Array<{
    risk: string;
    mitigation: string;
  }>;
  opportunityScore: number;
  overallOutlook: string;
}

export default function DashboardPage() {
  const { dataset, statistics, charts, analysisConfig } = useData();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chartsContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<number[]>([]);
  const [showChartSelector, setShowChartSelector] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  
  // Generate validation report
  const validationReport = useMemo(() => {
    if (!dataset || !statistics || !charts) return null;
    return DataValidator.validateDataset(dataset, statistics, charts);
  }, [dataset, statistics, charts]);
  
  // Generate dashboard narrative for voice
  const dashboardNarrative = useMemo(() => {
    if (!dataset || !statistics.length) return '';
    
    let narrative = `Dashboard Overview for ${dataset.name}.\n\n`;
    
    // Dataset summary
    narrative += `This dataset contains ${dataset.rowCount} records with ${statistics.length} columns analyzed.\n\n`;
    
    // KPI summary
    const numericStats = statistics.filter(s => s.mean !== undefined);
    if (numericStats.length > 0) {
      narrative += `Key Performance Indicators:\n`;
      numericStats.slice(0, 3).forEach(stat => {
        narrative += `${stat.column}: Average value is ${stat.mean?.toFixed(2)}, ranging from ${stat.min?.toFixed(2)} to ${stat.max?.toFixed(2)}. `;
        if (stat.skewnessType) {
          narrative += `The distribution is ${stat.skewnessType}. `;
        }
      });
      narrative += '\n\n';
    }
    
    // Chart explanations
    if (charts.length > 0) {
      narrative += `Visual Analysis:\n`;
      charts.slice(0, 3).forEach((chart, index) => {
        narrative += `Chart ${index + 1}: ${chart.type} chart showing ${chart.xAxis || 'data'} ${chart.yAxis ? `versus ${chart.yAxis}` : ''}. `;
        if (chart.explanation) {
          narrative += `${chart.explanation} `;
        }
      });
      narrative += '\n\n';
    }
    
    return narrative;
  }, [dataset, statistics, charts]);
  
  // Initialize selected charts when charts load
  useEffect(() => {
    if (charts.length > 0 && selectedCharts.length === 0) {
      setSelectedCharts(charts.map((_, i) => i));
    }
  }, [charts]);

  const handleGeneratePredictions = async () => {
    if (!dataset || !analysisConfig) return;
    
    setIsPredicting(true);
    setPredictionError(null);
    setShowPredictions(true);
    
    try {
      // Prepare data summary for AI
      const dataSummary = {
        datasetName: dataset.name,
        rowCount: dataset.rowCount,
        columns: statistics.map(stat => ({
          name: stat.column,
          type: stat.mean !== undefined ? 'number' : 'string',
          mean: stat.mean,
          min: stat.min,
          max: stat.max,
          std: stat.std,
          skewnessType: stat.skewnessType,
          uniqueCount: stat.uniqueCount,
        })),
        correlations: charts
          .filter(c => c.type === 'correlation' && c.correlation)
          .map(c => ({
            xColumn: c.xAxis || '',
            yColumn: c.yAxis || '',
            strength: c.correlation?.strength || 'none',
            value: c.correlation?.value || 0,
          })),
        analysisType: analysisConfig.type,
      };

      const { data, error } = await supabase.functions.invoke('generate-predictions', {
        body: { dataSummary },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate predictions');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setPredictionData(data);
      toast({
        title: "Predictions Generated",
        description: "AI has analyzed your data and generated insights.",
      });
    } catch (error) {
      console.error('Prediction error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate predictions';
      setPredictionError(message);
      toast({
        title: "Prediction Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  const handleExportFullReport = async () => {
    if (!dataset || !analysisConfig) return;
    
    setIsExporting(true);
    toast({
      title: "Generating Comprehensive Report",
      description: "Creating full analysis with visualizations and explanations...",
    });

    try {
      // Generate all insights
      const actionableInsights = generateActionableInsights(dataset, statistics);
      const marketInsights = generateMarketTrendInsights(dataset, statistics);
      const allInsights = [...actionableInsights, ...marketInsights];
      
      // Generate validation report
      const validationReport = DataValidator.validateDataset(dataset, statistics, charts);

      await generateComprehensivePDFReport({
        dataset,
        statistics,
        charts: charts.filter((_, i) => selectedCharts.includes(i)),
        insights: allInsights,
        analysisConfig,
        chartsContainerRef: chartsContainerRef.current,
        predictionData,
      });

      toast({
        title: "Report Generated Successfully",
        description: "Your comprehensive analysis report has been downloaded.",
      });
    } catch (error) {
      console.error('PDF report generation failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your report.",
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
      <div className="relative z-10 border-b border-border/50 backdrop-blur-sm sticky top-0 bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowChartSelector(!showChartSelector)}
            >
              <Settings2 className="mr-2 w-4 h-4" />
              {showChartSelector ? 'Hide' : 'Charts'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowPredictions(!showPredictions);
                if (!predictionData && !isPredicting) {
                  handleGeneratePredictions();
                }
              }}
            >
              <Brain className="mr-2 w-4 h-4" />
              {showPredictions ? 'Hide Predictions' : 'AI Predictions'}
            </Button>
            <Button 
              size="sm" 
              className="btn-gradient" 
              onClick={handleExportFullReport}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <FileText className="mr-2 w-4 h-4" />
              )}
              {isExporting ? 'Generating...' : 'Export Full Report'}
            </Button>
          </div>
        </div>
      </div>
      
      <div ref={dashboardRef} className="relative z-10 container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  <span className="gradient-text">{dataset.name}</span> Dashboard
                </h1>
                <p className="text-muted-foreground">
                  {analysisConfig.type.charAt(0).toUpperCase() + analysisConfig.type.slice(1)} analysis • 
                  {dataset.rowCount.toLocaleString()} rows • 
                  {analysisConfig.selectedColumns.length} columns analyzed
                </p>
              </div>
              
              {/* Dashboard Voice Player */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <VoicePlayer 
                  text={dashboardNarrative}
                  title="Dashboard Overview"
                  variant="compact"
                />
              </div>
            </div>
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
          
          {/* Data Validation Panel */}
          {validationReport && (
            <DataValidationPanel 
              report={validationReport}
              className="mb-8"
            />
          )}
          
          {/* Skewness & Distribution Info */}
          {numericStats.length > 0 && (
            <div className="glass-card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Distribution Analysis (Skewness)
              </h2>
              
              {/* Hypotheses Section */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h3 className="text-sm font-semibold mb-2 text-primary">Statistical Hypotheses</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>H₀ (Null):</strong> The data follows a normal distribution (skewness ≈ 0)</p>
                  <p><strong>H₁ (Alternative):</strong> The data deviates significantly from normal distribution</p>
                  <p><strong>Decision Rule:</strong> |Skewness| &gt; 0.5 suggests moderate deviation; |Skewness| &gt; 1.0 suggests strong deviation</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {numericStats.map(stat => (
                  <div 
                    key={stat.column}
                    className={`p-4 rounded-lg border ${
                      stat.skewnessType === 'symmetric' 
                        ? 'bg-green-400/5 border-green-400/30' 
                        : stat.skewnessType === 'right-skewed'
                        ? 'bg-yellow-400/5 border-yellow-400/30'
                        : 'bg-orange-400/5 border-orange-400/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm truncate">{stat.column}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`text-xs px-2 py-0.5 rounded-full cursor-help ${
                              stat.skewnessType === 'symmetric' 
                                ? 'bg-green-400/20 text-green-400' 
                                : stat.skewnessType === 'right-skewed'
                                ? 'bg-yellow-400/20 text-yellow-400'
                                : 'bg-orange-400/20 text-orange-400'
                            }`}>
                              {stat.skewnessType?.replace('-', ' ') || 'N/A'}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="text-xs">
                              {stat.skewnessType === 'symmetric' 
                                ? 'Symmetric Distribution: Data is evenly distributed around the mean. Bell-shaped curve with equal tails. Ideal for parametric statistical tests like t-tests and ANOVA.' 
                                : stat.skewnessType === 'right-skewed'
                                ? 'Right-Skewed Distribution: Tail extends toward higher values. Mean > Median. Common in income, sales data. Consider median for central tendency and log transformation for analysis.'
                                : 'Left-Skewed Distribution: Tail extends toward lower values. Mean < Median. May indicate ceiling effects or upper bounds. Review data collection methods and consider transformation.'}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">Skewness:</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="text-xs">
                                <p><strong>Skewness</strong> measures asymmetry of the distribution:</p>
                                <p>• 0 = Perfect symmetry</p>
                                <p>• &gt;0 = Right tail longer</p>
                                <p>• &lt;0 = Left tail longer</p>
                                <p>• |0.5-1| = Moderate skew</p>
                                <p>• |&gt;1| = High skew</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="ml-1 font-mono">{stat.skewness?.toFixed(3) ?? 'N/A'}</span>
                      </div>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">Kurtosis:</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="text-xs">
                                <p><strong>Kurtosis</strong> measures tail heaviness:</p>
                                <p>• 3 = Normal distribution</p>
                                <p>• &gt;3 = Heavy tails (leptokurtic)</p>
                                <p>• &lt;3 = Light tails (platykurtic)</p>
                                <p>High kurtosis indicates more outliers</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="ml-1 font-mono">{stat.kurtosis?.toFixed(3) ?? 'N/A'}</span>
                      </div>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">Std Dev:</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="text-xs">
                                <p><strong>Standard Deviation</strong> measures data spread around the mean.</p>
                                <p>• Low = Data clustered near mean</p>
                                <p>• High = Data widely dispersed</p>
                                <p>~68% of data within 1 std dev of mean</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="ml-1 font-mono">{stat.std?.toFixed(3) ?? 'N/A'}</span>
                      </div>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">Variance:</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="text-xs">
                                <p><strong>Variance</strong> is the square of standard deviation.</p>
                                <p>Measures average squared deviation from mean.</p>
                                <p>Used in ANOVA and regression analysis.</p>
                                <p>Units are squared (e.g., dollars²)</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="ml-1 font-mono">{stat.variance?.toFixed(3) ?? 'N/A'}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-muted/20 rounded text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium">Hypothesis Test Result:</span>
                      </div>
                      <p className="text-muted-foreground">
                        {Math.abs(stat.skewness || 0) <= 0.5 
                          ? '✅ Accept H₀: Distribution appears normal (|skewness| ≤ 0.5)'
                          : Math.abs(stat.skewness || 0) <= 1.0
                          ? '⚠️ Moderate deviation from H₀: Consider non-parametric tests'
                          : '❌ Reject H₀: Strong deviation from normality (|skewness| > 1.0)'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stat.skewnessType === 'symmetric' 
                        ? 'Normal-like distribution, suitable for parametric tests.' 
                        : stat.skewnessType === 'right-skewed'
                        ? 'Tail extends right (more extreme high values). Consider log transform.'
                        : 'Tail extends left (more extreme low values). Review for floor effects.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Chart Selector */}
          {showChartSelector && (
            <ChartSelector
              charts={charts}
              selectedCharts={selectedCharts}
              onSelectionChange={setSelectedCharts}
            />
          )}
          
          {/* Charts Grid with Explanations */}
          <div ref={chartsContainerRef} className="grid md:grid-cols-2 gap-6 mb-8">
            {charts
              .filter((_, i) => selectedCharts.includes(i))
              .map((chart, i) => (
                <div key={i} data-chart-container>
                  <ChartWithExplanation 
                    chart={chart} 
                    stats={statistics}
                    index={i}
                  />
                </div>
              ))}
          </div>
          
          {selectedCharts.length === 0 && !showPredictions && (
            <div className="glass-card p-12 text-center mb-8">
              <Settings2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Charts Selected</h3>
              <p className="text-muted-foreground mb-4">
                Click the "Charts" button above to select which visualizations to display.
              </p>
              <Button variant="outline" onClick={() => setShowChartSelector(true)}>
                Select Charts
              </Button>
            </div>
          )}
          
          {/* AI Predictions Panel */}
          {showPredictions && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Brain className="w-6 h-6 text-primary" />
                <span className="gradient-text">AI Predictions & Recommendations</span>
              </h2>
              <PredictionsPanel
                data={predictionData}
                isLoading={isPredicting}
                onGenerate={handleGeneratePredictions}
                error={predictionError}
              />
            </div>
          )}
          
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
