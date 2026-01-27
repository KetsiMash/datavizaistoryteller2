import { DataSet, StatSummary, Insight, ChartConfig, AnalysisType } from '@/types/analytics';

export function calculateStatistics(dataset: DataSet, columns: string[]): StatSummary[] {
  return columns.map(columnName => {
    const column = dataset.columns.find(c => c.name === columnName);
    const values = dataset.rows.map(row => row[columnName]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (column?.type === 'number') {
      const numValues = nonNullValues.map(Number).filter(n => !isNaN(n));
      const sorted = [...numValues].sort((a, b) => a - b);
      
      const sum = numValues.reduce((a, b) => a + b, 0);
      const mean = sum / numValues.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = Math.min(...numValues);
      const max = Math.max(...numValues);
      
      const squaredDiffs = numValues.map(v => Math.pow(v - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / numValues.length;
      const std = Math.sqrt(variance);
      
      // Mode
      const freq: Record<number, number> = {};
      numValues.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
      const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
      
      return {
        column: columnName,
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        mode: mode ? Number(mode) : undefined,
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        std: Number(std.toFixed(2)),
        variance: Number(variance.toFixed(2)),
        count: numValues.length,
        nullCount: values.length - nonNullValues.length,
        uniqueCount: new Set(numValues).size,
      };
    }
    
    // String/categorical column
    const freq: Record<string, number> = {};
    nonNullValues.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1; });
    const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    return {
      column: columnName,
      mode,
      count: nonNullValues.length,
      nullCount: values.length - nonNullValues.length,
      uniqueCount: new Set(nonNullValues.map(String)).size,
    };
  });
}

export function generateInsights(dataset: DataSet, stats: StatSummary[]): Insight[] {
  const insights: Insight[] = [];
  
  // Check for high null counts
  stats.forEach(stat => {
    const nullPercentage = (stat.nullCount / (stat.count + stat.nullCount)) * 100;
    if (nullPercentage > 10) {
      insights.push({
        id: `null-${stat.column}`,
        type: 'pattern',
        title: `Missing Data in ${stat.column}`,
        description: `${nullPercentage.toFixed(1)}% of values are missing in the "${stat.column}" column. Consider data imputation or investigation.`,
        severity: nullPercentage > 30 ? 'warning' : 'info',
        relatedColumns: [stat.column],
      });
    }
  });
  
  // Check for potential outliers in numeric columns
  stats.forEach(stat => {
    if (stat.std !== undefined && stat.mean !== undefined) {
      const cv = (stat.std / Math.abs(stat.mean)) * 100;
      if (cv > 100) {
        insights.push({
          id: `outlier-${stat.column}`,
          type: 'outlier',
          title: `High Variability in ${stat.column}`,
          description: `The "${stat.column}" column shows high variability (CV: ${cv.toFixed(1)}%). This may indicate outliers or naturally diverse data.`,
          severity: 'warning',
          relatedColumns: [stat.column],
        });
      }
    }
  });
  
  // Check for low cardinality
  stats.forEach(stat => {
    if (stat.uniqueCount < 5 && stat.count > 100) {
      insights.push({
        id: `category-${stat.column}`,
        type: 'pattern',
        title: `Categorical Pattern in ${stat.column}`,
        description: `"${stat.column}" has only ${stat.uniqueCount} unique values. Consider using this for grouping or segmentation analysis.`,
        severity: 'info',
        relatedColumns: [stat.column],
      });
    }
  });
  
  // Add positive insights
  if (dataset.rowCount > 1000) {
    insights.push({
      id: 'sample-size',
      type: 'pattern',
      title: 'Strong Sample Size',
      description: `Your dataset contains ${dataset.rowCount.toLocaleString()} records, providing good statistical power for analysis.`,
      severity: 'success',
    });
  }
  
  // Correlation hint
  const numericColumns = stats.filter(s => s.mean !== undefined);
  if (numericColumns.length >= 2) {
    insights.push({
      id: 'correlation-opportunity',
      type: 'recommendation',
      title: 'Correlation Analysis Available',
      description: `With ${numericColumns.length} numeric columns, you can explore relationships between variables using correlation analysis.`,
      severity: 'info',
      relatedColumns: numericColumns.map(s => s.column),
    });
  }
  
  return insights;
}

export function generateCharts(dataset: DataSet, columns: string[], analysisType: AnalysisType): ChartConfig[] {
  const charts: ChartConfig[] = [];
  const numericCols = columns.filter(col => 
    dataset.columns.find(c => c.name === col)?.type === 'number'
  );
  const categoricalCols = columns.filter(col => 
    dataset.columns.find(c => c.name === col)?.type === 'string'
  );
  
  // Bar chart for categorical data
  if (categoricalCols.length > 0) {
    const col = categoricalCols[0];
    const freq: Record<string, number> = {};
    dataset.rows.forEach(row => {
      const val = String(row[col] || 'Unknown');
      freq[val] = (freq[val] || 0) + 1;
    });
    
    const data = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
    
    charts.push({
      type: 'bar',
      title: `Distribution of ${col}`,
      xAxis: col,
      yAxis: 'Count',
      data,
    });
  }
  
  // Line/Area chart for numeric trends
  if (numericCols.length > 0) {
    const col = numericCols[0];
    const data = dataset.rows.slice(0, 50).map((row, idx) => ({
      name: idx + 1,
      value: Number(row[col]) || 0,
    }));
    
    charts.push({
      type: 'area',
      title: `Trend of ${col}`,
      xAxis: 'Index',
      yAxis: col,
      data,
    });
  }
  
  // Pie chart for categorical distribution
  if (categoricalCols.length > 0) {
    const col = categoricalCols[0];
    const freq: Record<string, number> = {};
    dataset.rows.forEach(row => {
      const val = String(row[col] || 'Unknown');
      freq[val] = (freq[val] || 0) + 1;
    });
    
    const data = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
    
    charts.push({
      type: 'pie',
      title: `${col} Breakdown`,
      data,
    });
  }
  
  // Scatter plot for correlation
  if (numericCols.length >= 2 && (analysisType === 'correlation' || analysisType === 'regression')) {
    const xCol = numericCols[0];
    const yCol = numericCols[1];
    
    const data = dataset.rows.slice(0, 100).map(row => ({
      x: Number(row[xCol]) || 0,
      y: Number(row[yCol]) || 0,
    }));
    
    charts.push({
      type: 'scatter',
      title: `${xCol} vs ${yCol}`,
      xAxis: xCol,
      yAxis: yCol,
      data,
    });
  }
  
  // Histogram for numeric distribution
  if (numericCols.length > 0) {
    const col = numericCols[numericCols.length > 1 ? 1 : 0];
    const values = dataset.rows.map(row => Number(row[col])).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 10;
    const binSize = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0).map((_, i) => ({
      name: `${(min + i * binSize).toFixed(1)}`,
      value: 0,
    }));
    
    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      if (binIndex >= 0 && binIndex < binCount) {
        bins[binIndex].value++;
      }
    });
    
    charts.push({
      type: 'histogram',
      title: `Histogram of ${col}`,
      xAxis: col,
      yAxis: 'Frequency',
      data: bins,
    });
  }
  
  return charts;
}

export function generateNarrative(
  dataset: DataSet, 
  stats: StatSummary[], 
  insights: Insight[]
): string {
  const numericStats = stats.filter(s => s.mean !== undefined);
  const categoricalStats = stats.filter(s => s.mean === undefined);
  
  let narrative = `## Data Story: ${dataset.name}\n\n`;
  narrative += `### Overview\n`;
  narrative += `Your dataset contains **${dataset.rowCount.toLocaleString()} records** across **${dataset.columns.length} variables**. `;
  narrative += `This analysis was conducted on ${new Date().toLocaleDateString()}.\n\n`;
  
  if (numericStats.length > 0) {
    narrative += `### Numeric Insights\n`;
    numericStats.forEach(stat => {
      narrative += `**${stat.column}**: Values range from ${stat.min} to ${stat.max}, `;
      narrative += `with an average of ${stat.mean}. `;
      if (stat.std && stat.mean && stat.std > stat.mean * 0.5) {
        narrative += `There's notable spread in the data (std: ${stat.std}). `;
      }
      narrative += '\n';
    });
    narrative += '\n';
  }
  
  if (categoricalStats.length > 0) {
    narrative += `### Categorical Findings\n`;
    categoricalStats.forEach(stat => {
      narrative += `**${stat.column}**: Contains ${stat.uniqueCount} unique categories. `;
      if (stat.mode) {
        narrative += `The most common value is "${stat.mode}". `;
      }
      narrative += '\n';
    });
    narrative += '\n';
  }
  
  if (insights.length > 0) {
    narrative += `### Key Discoveries\n`;
    const importantInsights = insights.filter(i => i.severity !== 'info').slice(0, 3);
    importantInsights.forEach(insight => {
      narrative += `- **${insight.title}**: ${insight.description}\n`;
    });
    narrative += '\n';
  }
  
  narrative += `### Recommendations\n`;
  narrative += `Based on this analysis, consider the following next steps:\n`;
  
  if (numericStats.length >= 2) {
    narrative += `1. Explore correlations between numeric variables to uncover hidden relationships.\n`;
  }
  if (categoricalStats.length > 0) {
    narrative += `2. Use categorical variables for segmentation and comparative analysis.\n`;
  }
  narrative += `3. Address any missing data identified in the insights before deeper analysis.\n`;
  narrative += `4. Consider temporal patterns if date fields are present.\n`;
  
  return narrative;
}
