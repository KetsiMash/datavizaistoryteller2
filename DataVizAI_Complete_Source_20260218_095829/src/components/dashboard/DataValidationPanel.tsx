import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  BarChart3,
  Target,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DataQualityReport } from '@/lib/dataValidation';

interface DataValidationPanelProps {
  report: DataQualityReport;
  className?: string;
}

export function DataValidationPanel({ report, className = '' }: DataValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return { variant: 'default' as const, label: 'Excellent' };
    if (confidence >= 70) return { variant: 'secondary' as const, label: 'Good' };
    if (confidence >= 50) return { variant: 'outline' as const, label: 'Fair' };
    return { variant: 'destructive' as const, label: 'Poor' };
  };

  return (
    <div className={`glass-card ${className}`}>
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Data Quality Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Validation results for accuracy and reliability
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Overall Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Confidence</span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getConfidenceColor(report.overall.confidence)}`}>
                {report.overall.confidence.toFixed(1)}%
              </span>
              <Badge {...getConfidenceBadge(report.overall.confidence)}>
                {getConfidenceBadge(report.overall.confidence).label}
              </Badge>
            </div>
          </div>
          <Progress value={report.overall.confidence} className="h-2" />
        </div>
        
        {/* Quality Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-lg font-bold">{report.completeness.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Completeness</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-lg font-bold">{report.accuracy.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-lg font-bold">{report.consistency.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Consistency</div>
          </div>
        </div>
        
        {/* Quick Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            {report.overall.errors.length === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {report.overall.errors.length === 0 ? 'No Critical Issues' : `${report.overall.errors.length} Critical Issues`}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {report.overall.warnings.length > 0 && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                {report.overall.warnings.length} warnings
              </span>
            )}
            {report.overall.recommendations.length > 0 && (
              <span className="flex items-center gap-1">
                <Info className="w-4 h-4 text-blue-500" />
                {report.overall.recommendations.length} tips
              </span>
            )}
          </div>
        </div>
        
        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            {/* Component Scores */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Component Analysis</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Statistical Calculations</span>
                  <div className="flex items-center gap-2">
                    <Progress value={report.statistics.confidence} className="w-20 h-1" />
                    <span className="text-sm font-mono w-12">{report.statistics.confidence.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Visualizations</span>
                  <div className="flex items-center gap-2">
                    <Progress value={report.visualizations.confidence} className="w-20 h-1" />
                    <span className="text-sm font-mono w-12">{report.visualizations.confidence.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Correlation Analysis</span>
                  <div className="flex items-center gap-2">
                    <Progress value={report.correlations.confidence} className="w-20 h-1" />
                    <span className="text-sm font-mono w-12">{report.correlations.confidence.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Issues */}
            {report.overall.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-red-600">Critical Issues</h4>
                <div className="space-y-1">
                  {report.overall.errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-red-700 dark:text-red-300">{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Warnings */}
            {report.overall.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-yellow-600">Warnings</h4>
                <div className="space-y-1">
                  {report.overall.warnings.slice(0, 3).map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span className="text-yellow-700 dark:text-yellow-300">{warning}</span>
                    </div>
                  ))}
                  {report.overall.warnings.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-6">
                      +{report.overall.warnings.length - 3} more warnings
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            {report.overall.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-600">Recommendations</h4>
                <div className="space-y-1">
                  {report.overall.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-blue-700 dark:text-blue-300">{rec}</span>
                    </div>
                  ))}
                  {report.overall.recommendations.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-6">
                      +{report.overall.recommendations.length - 3} more recommendations
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}