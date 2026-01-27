import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataSet, AnalysisConfig, Insight, ChartConfig, StatSummary } from '@/types/analytics';

interface DataContextType {
  dataset: DataSet | null;
  setDataset: (data: DataSet | null) => void;
  analysisConfig: AnalysisConfig | null;
  setAnalysisConfig: (config: AnalysisConfig | null) => void;
  insights: Insight[];
  setInsights: (insights: Insight[]) => void;
  charts: ChartConfig[];
  setCharts: (charts: ChartConfig[]) => void;
  statistics: StatSummary[];
  setStatistics: (stats: StatSummary[]) => void;
  narrative: string;
  setNarrative: (text: string) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<DataSet | null>(null);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [statistics, setStatistics] = useState<StatSummary[]>([]);
  const [narrative, setNarrative] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <DataContext.Provider
      value={{
        dataset,
        setDataset,
        analysisConfig,
        setAnalysisConfig,
        insights,
        setInsights,
        charts,
        setCharts,
        statistics,
        setStatistics,
        narrative,
        setNarrative,
        isProcessing,
        setIsProcessing,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
