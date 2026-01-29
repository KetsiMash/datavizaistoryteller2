import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Prediction {
  title: string;
  prediction: string;
  confidence: 'high' | 'medium' | 'low';
  timeframe: 'short-term' | 'medium-term' | 'long-term';
  basedOn: string;
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  expectedImpact: string;
  implementation: string;
}

interface RiskFactor {
  risk: string;
  mitigation: string;
}

interface PredictionData {
  predictions: Prediction[];
  recommendations: Recommendation[];
  riskFactors: RiskFactor[];
  opportunityScore: number;
  overallOutlook: string;
}

interface PredictionsPanelProps {
  data: PredictionData | null;
  isLoading: boolean;
  onGenerate: () => void;
  error?: string | null;
}

export function PredictionsPanel({ data, isLoading, onGenerate, error }: PredictionsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    predictions: true,
    recommendations: true,
    risks: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'medium': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'low': return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      case 'medium': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'low': return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeframeIcon = (timeframe: string) => {
    switch (timeframe) {
      case 'short-term': return '⚡';
      case 'medium-term': return '📅';
      case 'long-term': return '🎯';
      default: return '📊';
    }
  };

  if (!data && !isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        <Brain className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">AI Predictions & Recommendations</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Generate AI-powered predictions and strategic recommendations based on your data analysis.
        </p>
        <Button onClick={onGenerate} className="btn-gradient">
          <Sparkles className="mr-2 w-4 h-4" />
          Generate AI Predictions
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold mb-2">Analyzing Your Data...</h3>
        <p className="text-muted-foreground">
          AI is generating predictions and recommendations based on your dataset patterns.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center border-red-500/30">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onGenerate} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Opportunity Score Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Opportunity Score</h2>
              <p className="text-sm text-muted-foreground">Based on data patterns and trends</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold gradient-text">{data.opportunityScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>
        <Progress value={data.opportunityScore} className="h-3 mb-4" />
        <p className="text-sm text-muted-foreground leading-relaxed">{data.overallOutlook}</p>
      </div>

      {/* Predictions Section */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => toggleSection('predictions')}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-semibold">Predictions ({data.predictions.length})</span>
          </div>
          {expandedSections.predictions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.predictions && (
          <div className="p-4 pt-0 space-y-4">
            {data.predictions.map((pred, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="font-semibold">{pred.title}</h4>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(pred.confidence)}`}>
                      {pred.confidence} confidence
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted border border-border">
                      {getTimeframeIcon(pred.timeframe)} {pred.timeframe}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{pred.prediction}</p>
                <p className="text-xs text-muted-foreground/70 italic">Based on: {pred.basedOn}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => toggleSection('recommendations')}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold">Recommendations ({data.recommendations.length})</span>
          </div>
          {expandedSections.recommendations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.recommendations && (
          <div className="p-4 pt-0 space-y-4">
            {data.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    {rec.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${getPriorityColor(rec.priority)}`}>
                    {rec.priority} priority
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2 rounded bg-green-400/10 border border-green-400/20">
                    <span className="text-green-400 font-medium">Expected Impact:</span>
                    <p className="text-muted-foreground mt-1">{rec.expectedImpact}</p>
                  </div>
                  <div className="p-2 rounded bg-blue-400/10 border border-blue-400/20">
                    <span className="text-blue-400 font-medium">Implementation:</span>
                    <p className="text-muted-foreground mt-1">{rec.implementation}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Factors Section */}
      {data.riskFactors.length > 0 && (
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection('risks')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">Risk Factors ({data.riskFactors.length})</span>
            </div>
            {expandedSections.risks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.risks && (
            <div className="p-4 pt-0 space-y-3">
              {data.riskFactors.map((risk, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-lg bg-orange-400/5 border border-orange-400/20"
                >
                  <p className="text-sm font-medium text-orange-400 mb-2">⚠️ {risk.risk}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-green-400">Mitigation:</span> {risk.mitigation}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regenerate Button */}
      <div className="text-center">
        <Button onClick={onGenerate} variant="outline" size="sm">
          <Sparkles className="mr-2 w-4 h-4" />
          Regenerate Predictions
        </Button>
      </div>
    </motion.div>
  );
}
