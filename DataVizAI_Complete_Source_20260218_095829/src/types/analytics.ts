export interface DataColumn {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  sample: any[];
  nullCount: number;
  uniqueCount: number;
}

export interface DataSet {
  name: string;
  rows: Record<string, any>[];
  columns: DataColumn[];
  rowCount: number;
  uploadedAt: Date;
}

export type AnalysisType = 
  | 'descriptive'
  | 'correlation'
  | 'trend'
  | 'clustering'
  | 'regression'
  | 'classification';

export interface AnalysisConfig {
  type: AnalysisType;
  selectedColumns: string[];
  targetColumn?: string;
}

export interface StatSummary {
  column: string;
  mean?: number;
  median?: number;
  mode?: string | number;
  min?: number;
  max?: number;
  std?: number;
  variance?: number;
  skewness?: number;
  skewnessType?: 'symmetric' | 'right-skewed' | 'left-skewed';
  kurtosis?: number;
  count: number;
  nullCount: number;
  uniqueCount: number;
}

export interface Insight {
  id: string;
  type: 'pattern' | 'outlier' | 'correlation' | 'trend' | 'recommendation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
  relatedColumns?: string[];
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'boxplot' | 'area' | 'correlation';
  title: string;
  xAxis?: string;
  yAxis?: string;
  data: any[];
  regression?: {
    slope: number;
    intercept: number;
    rSquared: number;
    equation: string;
  };
  correlation?: {
    value: number;
    strength: 'strong' | 'moderate' | 'weak' | 'none';
    interpretation: string;
  };
}
