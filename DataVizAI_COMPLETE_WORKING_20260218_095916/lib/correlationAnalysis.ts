import { DataSet } from '@/types/analytics';

export interface CorrelationResult {
  xColumn: string;
  yColumn: string;
  correlation: number;
  interpretation: string;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  equation: string;
}

export interface ScatterDataPoint {
  x: number;
  y: number;
  regressionY?: number;
}

export interface CorrelationChartData {
  xColumn: string;
  yColumn: string;
  data: ScatterDataPoint[];
  regression: RegressionResult;
  correlation: CorrelationResult;
}

// Calculate Pearson correlation coefficient
export function calculateCorrelation(xValues: number[], yValues: number[]): number {
  const n = Math.min(xValues.length, yValues.length);
  if (n < 2) return 0;
  
  const xFiltered: number[] = [];
  const yFiltered: number[] = [];
  
  for (let i = 0; i < n; i++) {
    if (!isNaN(xValues[i]) && !isNaN(yValues[i]) && isFinite(xValues[i]) && isFinite(yValues[i])) {
      xFiltered.push(xValues[i]);
      yFiltered.push(yValues[i]);
    }
  }
  
  if (xFiltered.length < 2) return 0;
  
  const meanX = xFiltered.reduce((a, b) => a + b, 0) / xFiltered.length;
  const meanY = yFiltered.reduce((a, b) => a + b, 0) / yFiltered.length;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < xFiltered.length; i++) {
    const diffX = xFiltered[i] - meanX;
    const diffY = yFiltered[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

// Calculate linear regression (least squares)
export function calculateLinearRegression(xValues: number[], yValues: number[]): RegressionResult {
  const n = Math.min(xValues.length, yValues.length);
  const xFiltered: number[] = [];
  const yFiltered: number[] = [];
  
  for (let i = 0; i < n; i++) {
    if (!isNaN(xValues[i]) && !isNaN(yValues[i]) && isFinite(xValues[i]) && isFinite(yValues[i])) {
      xFiltered.push(xValues[i]);
      yFiltered.push(yValues[i]);
    }
  }
  
  if (xFiltered.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, equation: 'y = 0' };
  }
  
  const meanX = xFiltered.reduce((a, b) => a + b, 0) / xFiltered.length;
  const meanY = yFiltered.reduce((a, b) => a + b, 0) / yFiltered.length;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < xFiltered.length; i++) {
    numerator += (xFiltered[i] - meanX) * (yFiltered[i] - meanY);
    denominator += (xFiltered[i] - meanX) ** 2;
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;
  
  // Calculate R-squared
  let ssTot = 0;
  let ssRes = 0;
  
  for (let i = 0; i < xFiltered.length; i++) {
    const predicted = slope * xFiltered[i] + intercept;
    ssRes += (yFiltered[i] - predicted) ** 2;
    ssTot += (yFiltered[i] - meanY) ** 2;
  }
  
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;
  
  const slopeStr = slope >= 0 ? slope.toFixed(4) : `(${slope.toFixed(4)})`;
  const interceptStr = intercept >= 0 ? `+ ${intercept.toFixed(2)}` : `- ${Math.abs(intercept).toFixed(2)}`;
  const equation = `y = ${slopeStr}x ${interceptStr}`;
  
  return { slope, intercept, rSquared: Math.max(0, rSquared), equation };
}

// Interpret correlation strength
export function interpretCorrelation(r: number): { interpretation: string; strength: 'strong' | 'moderate' | 'weak' | 'none' } {
  const absR = Math.abs(r);
  const direction = r >= 0 ? 'positive' : 'negative';
  
  if (absR >= 0.7) {
    return {
      interpretation: `Strong ${direction} correlation (r = ${r.toFixed(3)}). Variables move together ${direction === 'positive' ? 'in the same' : 'in opposite'} direction${direction === 'positive' ? 's' : 's'}.`,
      strength: 'strong'
    };
  } else if (absR >= 0.4) {
    return {
      interpretation: `Moderate ${direction} correlation (r = ${r.toFixed(3)}). There's a notable ${direction} relationship between these variables.`,
      strength: 'moderate'
    };
  } else if (absR >= 0.2) {
    return {
      interpretation: `Weak ${direction} correlation (r = ${r.toFixed(3)}). Limited linear relationship exists between these variables.`,
      strength: 'weak'
    };
  } else {
    return {
      interpretation: `No significant correlation (r = ${r.toFixed(3)}). Variables appear to be independent of each other.`,
      strength: 'none'
    };
  }
}

// Calculate skewness using Fisher-Pearson standardized moment coefficient
export function calculateSkewness(values: number[]): number {
  const filtered = values.filter(v => !isNaN(v) && isFinite(v));
  const n = filtered.length;
  
  if (n < 3) return 0;
  
  const mean = filtered.reduce((a, b) => a + b, 0) / n;
  const variance = filtered.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  
  if (std === 0) return 0;
  
  const m3 = filtered.reduce((sum, v) => sum + ((v - mean) / std) ** 3, 0) / n;
  
  // Adjust for sample skewness
  const adjustment = Math.sqrt(n * (n - 1)) / (n - 2);
  return adjustment * m3;
}

// Interpret skewness
export function interpretSkewness(skewness: number): { description: string; type: 'symmetric' | 'right-skewed' | 'left-skewed' } {
  if (Math.abs(skewness) < 0.5) {
    return {
      description: 'Distribution is approximately symmetric (normal-like)',
      type: 'symmetric'
    };
  } else if (skewness >= 0.5) {
    return {
      description: `Right-skewed (positive skew: ${skewness.toFixed(2)}). Tail extends to the right with more extreme high values.`,
      type: 'right-skewed'
    };
  } else {
    return {
      description: `Left-skewed (negative skew: ${skewness.toFixed(2)}). Tail extends to the left with more extreme low values.`,
      type: 'left-skewed'
    };
  }
}

// Calculate kurtosis (excess kurtosis)
export function calculateKurtosis(values: number[]): number {
  const filtered = values.filter(v => !isNaN(v) && isFinite(v));
  const n = filtered.length;
  
  if (n < 4) return 0;
  
  const mean = filtered.reduce((a, b) => a + b, 0) / n;
  const variance = filtered.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  
  if (std === 0) return 0;
  
  const m4 = filtered.reduce((sum, v) => sum + ((v - mean) / std) ** 4, 0) / n;
  
  // Excess kurtosis (subtract 3 for normal distribution baseline)
  return m4 - 3;
}

// Generate all pairwise correlations for numeric columns
export function generateCorrelationMatrix(dataset: DataSet, numericColumns: string[]): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const xCol = numericColumns[i];
      const yCol = numericColumns[j];
      
      const xValues = dataset.rows.map(row => Number(row[xCol]));
      const yValues = dataset.rows.map(row => Number(row[yCol]));
      
      const r = calculateCorrelation(xValues, yValues);
      const { interpretation, strength } = interpretCorrelation(r);
      
      results.push({
        xColumn: xCol,
        yColumn: yCol,
        correlation: r,
        interpretation,
        strength
      });
    }
  }
  
  // Sort by absolute correlation strength
  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

// Generate scatter plot data with regression line
export function generateCorrelationChartData(
  dataset: DataSet, 
  xColumn: string, 
  yColumn: string
): CorrelationChartData {
  const xValues = dataset.rows.map(row => Number(row[xColumn]));
  const yValues = dataset.rows.map(row => Number(row[yColumn]));
  
  const r = calculateCorrelation(xValues, yValues);
  const regression = calculateLinearRegression(xValues, yValues);
  const { interpretation, strength } = interpretCorrelation(r);
  
  // Create scatter data points with regression line values
  const data: ScatterDataPoint[] = [];
  const validIndices: number[] = [];
  
  for (let i = 0; i < Math.min(xValues.length, yValues.length); i++) {
    if (!isNaN(xValues[i]) && !isNaN(yValues[i]) && isFinite(xValues[i]) && isFinite(yValues[i])) {
      validIndices.push(i);
    }
  }
  
  // Sample if too many points
  const sampleSize = Math.min(validIndices.length, 200);
  const step = Math.floor(validIndices.length / sampleSize) || 1;
  
  for (let i = 0; i < validIndices.length; i += step) {
    const idx = validIndices[i];
    data.push({
      x: xValues[idx],
      y: yValues[idx],
      regressionY: regression.slope * xValues[idx] + regression.intercept
    });
  }
  
  return {
    xColumn,
    yColumn,
    data,
    regression,
    correlation: {
      xColumn,
      yColumn,
      correlation: r,
      interpretation,
      strength
    }
  };
}
