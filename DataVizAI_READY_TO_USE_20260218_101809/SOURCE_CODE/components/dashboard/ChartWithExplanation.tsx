import { motion } from 'framer-motion';
import { ChartConfig, StatSummary } from '@/types/analytics';
import { ChartCard } from './ChartCard';
import { generateChartExplanation } from '@/lib/insightGenerator';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ChartWithExplanationProps {
  chart: ChartConfig;
  stats: StatSummary[];
  index: number;
}

export function ChartWithExplanation({ chart, stats, index }: ChartWithExplanationProps) {
  const [showExplanation, setShowExplanation] = useState(true);
  const explanation = generateChartExplanation(chart, stats);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-3"
    >
      <ChartCard chart={chart} />
      
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Analysis</span>
          </div>
          {showExplanation ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
