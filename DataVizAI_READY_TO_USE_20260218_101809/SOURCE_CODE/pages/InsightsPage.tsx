import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { 
  BarChart3, 
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  Info,
  ArrowRight,
  Zap,
  Target,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { Insight } from '@/types/analytics';
import { generateActionableInsights, generateMarketTrendInsights } from '@/lib/insightGenerator';
import { VoicePlayer } from '@/components/VoicePlayer';

const getInsightIcon = (type: Insight['type']) => {
  switch (type) {
    case 'pattern': return TrendingUp;
    case 'outlier': return AlertTriangle;
    case 'correlation': return Lightbulb;
    case 'trend': return TrendingUp;
    case 'recommendation': return CheckCircle;
    default: return Info;
  }
};

const getSeverityStyles = (severity: Insight['severity']) => {
  switch (severity) {
    case 'warning': return 'border-l-chart-3 bg-chart-3/5';
    case 'success': return 'border-l-chart-6 bg-chart-6/5';
    default: return 'border-l-chart-5 bg-chart-5/5';
  }
};

export default function InsightsPage() {
  const { dataset, statistics } = useData();

  // Generate enhanced actionable insights
  const actionableInsights = useMemo(() => {
    if (!dataset || statistics.length === 0) return [];
    return generateActionableInsights(dataset, statistics);
  }, [dataset, statistics]);

  const trendInsights = useMemo(() => {
    if (!dataset || statistics.length === 0) return [];
    return generateMarketTrendInsights(dataset, statistics);
  }, [dataset, statistics]);

  const allInsights = [...actionableInsights, ...trendInsights];

  // Calculate insight categories
  const warningInsights = allInsights.filter(i => i.severity === 'warning');
  const infoInsights = allInsights.filter(i => i.severity === 'info');
  const successInsights = allInsights.filter(i => i.severity === 'success');

  // Generate narrative text for voice playback
  const insightsNarrative = useMemo(() => {
    if (allInsights.length === 0) return '';
    
    let narrative = `Data Insights Summary for ${dataset?.name || 'your dataset'}.\n\n`;
    
    // Add summary stats
    narrative += `We found ${allInsights.length} key insights: ${warningInsights.length} items need attention, ${infoInsights.length} opportunities identified, and ${successInsights.length} strengths discovered.\n\n`;
    
    // Add insights by priority
    const priorityOrder = ['warning', 'info', 'success'] as const;
    
    priorityOrder.forEach(severity => {
      const insights = allInsights.filter(i => i.severity === severity);
      if (insights.length === 0) return;
      
      const sectionTitle = severity === 'warning' ? 'Items Needing Attention' : 
                          severity === 'info' ? 'Opportunities' : 'Strengths';
      
      narrative += `${sectionTitle}:\n\n`;
      
      insights.forEach((insight, index) => {
        narrative += `${index + 1}. ${insight.title}. ${insight.description}`;
        
        if ('whyItMatters' in insight) {
          narrative += ` This matters because ${(insight as any).whyItMatters}`;
        }
        
        if ('action' in insight) {
          narrative += ` Recommended action: ${(insight as any).action}`;
        }
        
        if ('impact' in insight) {
          narrative += ` Expected impact: ${(insight as any).impact}`;
        }
        
        narrative += '\n\n';
      });
    });
    
    return narrative;
  }, [allInsights, dataset, warningInsights.length, infoInsights.length, successInsights.length]);

  if (!dataset || allInsights.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Insights Available</h2>
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

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DataViz AI</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Actionable <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Data-driven conclusions explaining <strong>what happened</strong>, <strong>why it matters</strong>, and <strong>what action to take</strong>.
            </p>
          </div>
          
          {/* Voice Player for Insights */}
          <div className="mb-8">
            <VoicePlayer 
              text={insightsNarrative}
              title="Listen to Key Insights"
              variant="compact"
              className="glass-card p-4"
            />
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-chart-3">{warningInsights.length}</p>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-chart-5">{infoInsights.length}</p>
              <p className="text-sm text-muted-foreground">Opportunities</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-chart-6">{successInsights.length}</p>
              <p className="text-sm text-muted-foreground">Strengths</p>
            </div>
          </div>
          
          {/* Insights List */}
          <div className="space-y-6">
            {allInsights.map((insight, i) => {
              const Icon = getInsightIcon(insight.type);
              const hasAction = 'action' in insight;
              
              return (
                <motion.div
                  key={insight.id}
                  className={`glass-card p-6 border-l-4 ${getSeverityStyles(insight.severity)}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      insight.severity === 'warning' ? 'bg-chart-3/20 text-chart-3' :
                      insight.severity === 'success' ? 'bg-chart-6/20 text-chart-6' :
                      'bg-chart-5/20 text-chart-5'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{insight.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          insight.severity === 'warning' ? 'bg-chart-3/20 text-chart-3' :
                          insight.severity === 'success' ? 'bg-chart-6/20 text-chart-6' :
                          'bg-chart-5/20 text-chart-5'
                        }`}>
                          {insight.type}
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-muted-foreground">{insight.description}</p>
                      
                      {/* Why It Matters */}
                      {hasAction && (insight as any).whyItMatters && (
                        <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Why It Matters</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {(insight as any).whyItMatters}
                          </p>
                        </div>
                      )}
                      
                      {/* Action to Take */}
                      {hasAction && (insight as any).action && (
                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Recommended Action</span>
                          </div>
                          <p className="text-sm">
                            {(insight as any).action}
                          </p>
                        </div>
                      )}
                      
                      {/* Impact */}
                      {hasAction && (insight as any).impact && (
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-chart-6" />
                          <span className="text-chart-6 font-medium">Potential Impact:</span>
                          <span className="text-muted-foreground">{(insight as any).impact}</span>
                        </div>
                      )}
                      
                      {/* Related Columns */}
                      {insight.relatedColumns && insight.relatedColumns.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">Related fields:</span>
                          {insight.relatedColumns.map(col => (
                            <span key={col} className="text-xs font-mono px-2 py-1 bg-secondary rounded">
                              {col}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Statistics Summary */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Statistical Summary</h2>
            <div className="glass-card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Mean</th>
                    <th>Median</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Std Dev</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.filter(s => s.mean !== undefined).map(stat => (
                    <tr key={stat.column}>
                      <td className="font-medium">{stat.column}</td>
                      <td>{stat.mean?.toFixed(2)}</td>
                      <td>{stat.median?.toFixed(2)}</td>
                      <td>{stat.min?.toFixed(2)}</td>
                      <td>{stat.max?.toFixed(2)}</td>
                      <td>{stat.std?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
