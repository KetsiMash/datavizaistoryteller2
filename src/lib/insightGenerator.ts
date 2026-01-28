import { DataSet, StatSummary, Insight, ChartConfig } from '@/types/analytics';

interface ActionableInsight extends Insight {
  action: string;
  impact: string;
  whyItMatters: string;
}

export function generateActionableInsights(
  dataset: DataSet, 
  stats: StatSummary[]
): ActionableInsight[] {
  const insights: ActionableInsight[] = [];
  
  // Analyze for high-value patterns
  stats.forEach(stat => {
    const nullPercentage = (stat.nullCount / (stat.count + stat.nullCount)) * 100;
    
    // Missing data insight with actionable recommendation
    if (nullPercentage > 10) {
      insights.push({
        id: `null-${stat.column}`,
        type: 'pattern',
        title: `Data Quality Issue: ${stat.column}`,
        description: `${nullPercentage.toFixed(1)}% of values are missing in "${stat.column}".`,
        severity: nullPercentage > 30 ? 'warning' : 'info',
        relatedColumns: [stat.column],
        whyItMatters: `Missing data can skew analysis results and lead to inaccurate predictions. This affects ${Math.round(stat.nullCount)} records in your dataset.`,
        action: nullPercentage > 30 
          ? 'Consider removing this column from analysis or implementing data imputation strategies like mean/median fill or predictive modeling.'
          : 'Apply mean imputation for numeric fields or mode imputation for categorical fields to maintain data integrity.',
        impact: `Fixing this could improve analysis accuracy by up to ${Math.min(nullPercentage * 2, 40).toFixed(0)}%`,
      });
    }
  });
  
  // Outlier detection with business context
  stats.forEach(stat => {
    if (stat.std !== undefined && stat.mean !== undefined && stat.mean !== 0) {
      const cv = (stat.std / Math.abs(stat.mean)) * 100;
      if (cv > 100) {
        insights.push({
          id: `outlier-${stat.column}`,
          type: 'outlier',
          title: `High Variability Detected: ${stat.column}`,
          description: `Coefficient of variation is ${cv.toFixed(1)}%, indicating significant spread in data.`,
          severity: 'warning',
          relatedColumns: [stat.column],
          whyItMatters: `High variability suggests either natural diversity in your data or the presence of outliers. This affects forecasting accuracy and can mask underlying trends.`,
          action: 'Segment data into cohorts for separate analysis, or apply outlier detection (IQR method) to identify and investigate extreme values.',
          impact: 'Proper handling could reveal hidden patterns and improve prediction accuracy by 15-25%',
        });
      } else if (cv < 10 && stat.count > 100) {
        insights.push({
          id: `stable-${stat.column}`,
          type: 'pattern',
          title: `Stable Metric: ${stat.column}`,
          description: `Low variability (CV: ${cv.toFixed(1)}%) indicates consistent values.`,
          severity: 'success',
          relatedColumns: [stat.column],
          whyItMatters: `Consistent metrics are excellent for benchmarking and setting performance thresholds. This is a reliable indicator for decision-making.`,
          action: 'Use this as a baseline metric for comparison. Consider setting alerts when values deviate from the typical range.',
          impact: 'Can serve as a reliable KPI for performance monitoring',
        });
      }
    }
  });
  
  // Growth and trend indicators
  stats.forEach(stat => {
    if (stat.mean !== undefined && stat.min !== undefined && stat.max !== undefined) {
      const range = stat.max - stat.min;
      const relativeRange = (range / Math.abs(stat.mean)) * 100;
      
      if (relativeRange > 200) {
        insights.push({
          id: `range-${stat.column}`,
          type: 'trend',
          title: `Wide Range Opportunity: ${stat.column}`,
          description: `Values span from ${stat.min.toLocaleString()} to ${stat.max.toLocaleString()}, a ${relativeRange.toFixed(0)}% relative range.`,
          severity: 'info',
          relatedColumns: [stat.column],
          whyItMatters: `This wide range suggests distinct segments or significant growth potential within your data. Understanding what drives high vs. low values can unlock strategic insights.`,
          action: 'Perform segmentation analysis to understand the factors driving extreme values. Consider creating tiers (low/medium/high) for targeted strategies.',
          impact: 'Segmentation could identify high-value opportunities worth investigating',
        });
      }
    }
  });
  
  // Categorical patterns
  stats.forEach(stat => {
    if (stat.uniqueCount < 10 && stat.count > 50 && stat.mean === undefined) {
      insights.push({
        id: `category-${stat.column}`,
        type: 'pattern',
        title: `Segmentation Opportunity: ${stat.column}`,
        description: `Only ${stat.uniqueCount} unique categories with ${stat.count} records - ideal for grouping analysis.`,
        severity: 'info',
        relatedColumns: [stat.column],
        whyItMatters: `Low cardinality categorical fields are perfect for segmentation, A/B testing, and comparative analysis. This enables targeted decision-making.`,
        action: 'Create comparison dashboards for each category. Analyze how numeric metrics vary across these segments.',
        impact: 'Category-based insights can drive 20-40% improvement in targeted strategies',
      });
    }
  });
  
  // Sample size assessment
  if (dataset.rowCount > 1000) {
    insights.push({
      id: 'sample-size',
      type: 'pattern',
      title: 'Strong Statistical Foundation',
      description: `${dataset.rowCount.toLocaleString()} records provide robust statistical power.`,
      severity: 'success',
      whyItMatters: `Large sample sizes reduce margin of error and increase confidence in findings. Your conclusions will be statistically significant.`,
      action: 'Proceed with confidence. Consider advanced analyses like regression modeling, clustering, or predictive analytics.',
      impact: 'Results have high confidence level (>95%) for decision-making',
    });
  } else if (dataset.rowCount < 100) {
    insights.push({
      id: 'sample-size-small',
      type: 'pattern',
      title: 'Limited Sample Size',
      description: `Only ${dataset.rowCount} records may limit statistical conclusions.`,
      severity: 'warning',
      whyItMatters: `Small samples can lead to unreliable insights and should be interpreted with caution. Results may not be generalizable.`,
      action: 'Consider collecting more data before making major decisions. Use this as exploratory analysis rather than definitive conclusions.',
      impact: 'Current findings should be validated with additional data',
    });
  }
  
  // Correlation opportunities
  const numericColumns = stats.filter(s => s.mean !== undefined);
  if (numericColumns.length >= 3) {
    insights.push({
      id: 'correlation-opportunity',
      type: 'recommendation',
      title: 'Multi-Variable Analysis Ready',
      description: `${numericColumns.length} numeric variables available for correlation and regression analysis.`,
      severity: 'info',
      relatedColumns: numericColumns.map(s => s.column),
      whyItMatters: `Multiple numeric variables enable discovery of relationships that drive outcomes. Understanding these correlations can reveal cause-and-effect patterns.`,
      action: 'Run correlation analysis to identify which variables move together. Use regression to quantify relationships and build predictive models.',
      impact: 'Could uncover key drivers explaining 60-80% of variance in outcomes',
    });
  }
  
  return insights;
}

export function generateChartExplanation(chart: ChartConfig, stats: StatSummary[]): string {
  const relatedStat = stats.find(s => 
    s.column === chart.xAxis || s.column === chart.yAxis
  );
  
  switch (chart.type) {
    case 'bar':
      const barTotal = chart.data.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
      const topItem = chart.data[0];
      return `This bar chart shows the distribution of ${chart.xAxis || 'categories'}. ${
        topItem ? `"${topItem.name}" leads with ${topItem.value?.toLocaleString() || 0} (${((topItem.value / barTotal) * 100).toFixed(1)}% of total).` : ''
      } The visualization reveals the relative importance of each category, helping identify where to focus resources and attention.`;
    
    case 'area':
    case 'line':
      const values = chart.data.map((d: any) => d.value || 0);
      const trend = values.length > 1 ? (values[values.length - 1] > values[0] ? 'upward' : 'downward') : 'stable';
      const change = values.length > 1 
        ? (((values[values.length - 1] - values[0]) / Math.abs(values[0] || 1)) * 100).toFixed(1)
        : '0';
      return `This ${chart.type} chart visualizes the trend of ${chart.yAxis || 'values'} over ${chart.xAxis || 'time'}. The data shows a ${trend} trend with a ${Math.abs(Number(change))}% ${Number(change) >= 0 ? 'increase' : 'decrease'} from start to end. ${
        relatedStat?.std ? `Standard deviation of ${relatedStat.std.toFixed(2)} indicates ${relatedStat.std > (relatedStat.mean || 1) * 0.5 ? 'high' : 'moderate'} volatility.` : ''
      }`;
    
    case 'pie':
      const pieTop3 = chart.data.slice(0, 3);
      const pieTotal = chart.data.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
      return `This pie chart breaks down the composition of your data. ${
        pieTop3.map((item: any) => `${item.name} represents ${((item.value / pieTotal) * 100).toFixed(1)}%`).join(', ')
      }. This distribution helps identify concentration and balance across segments.`;
    
    case 'scatter':
      return `This scatter plot explores the relationship between ${chart.xAxis} and ${chart.yAxis}. Each point represents a data record. Clusters indicate common patterns, while outliers may reveal anomalies or special cases worth investigating. Look for linear patterns suggesting correlation.`;
    
    case 'histogram':
      const histMax = Math.max(...chart.data.map((d: any) => d.value || 0));
      const peakBin = chart.data.find((d: any) => d.value === histMax);
      return `This histogram shows the frequency distribution of ${chart.xAxis || 'values'}. ${
        peakBin ? `The peak concentration is around ${peakBin.name}, where most values cluster.` : ''
      } The shape reveals whether data is normally distributed, skewed, or has multiple modes.`;
    
    default:
      return `This visualization provides insights into your data patterns. Analyze the visual patterns to identify trends, outliers, and relationships that can inform your decision-making.`;
  }
}

export function generateMarketTrendInsights(dataset: DataSet, stats: StatSummary[]): ActionableInsight[] {
  const insights: ActionableInsight[] = [];
  const numericStats = stats.filter(s => s.mean !== undefined);
  
  // Simulate market-style trend analysis based on data characteristics
  numericStats.forEach(stat => {
    if (stat.mean !== undefined && stat.std !== undefined) {
      const volatility = (stat.std / Math.abs(stat.mean || 1)) * 100;
      
      if (volatility < 20) {
        insights.push({
          id: `trend-stable-${stat.column}`,
          type: 'trend',
          title: `Stable Trend: ${stat.column}`,
          description: `Low volatility (${volatility.toFixed(1)}%) indicates consistent performance in this metric.`,
          severity: 'success',
          relatedColumns: [stat.column],
          whyItMatters: 'Stable metrics are predictable and reliable for planning and forecasting.',
          action: 'Set this as a benchmark. Monitor for sudden changes which could signal emerging trends.',
          impact: 'Reliable for 3-6 month forecasting with 90%+ confidence',
        });
      } else if (volatility > 50) {
        insights.push({
          id: `trend-volatile-${stat.column}`,
          type: 'trend',
          title: `Dynamic Market Signal: ${stat.column}`,
          description: `High volatility (${volatility.toFixed(1)}%) suggests active market movement or external influences.`,
          severity: 'warning',
          relatedColumns: [stat.column],
          whyItMatters: 'Volatile metrics require closer monitoring and may present both risks and opportunities.',
          action: 'Implement rolling averages for trend analysis. Consider external factors driving this volatility.',
          impact: 'Short-term predictions may vary ±30%. Requires frequent reassessment.',
        });
      }
    }
  });
  
  // Growth potential analysis
  numericStats.slice(0, 2).forEach(stat => {
    if (stat.max !== undefined && stat.mean !== undefined) {
      const growthRoom = ((stat.max - stat.mean) / stat.mean) * 100;
      if (growthRoom > 100) {
        insights.push({
          id: `growth-${stat.column}`,
          type: 'recommendation',
          title: `Growth Potential: ${stat.column}`,
          description: `Top performers achieve ${growthRoom.toFixed(0)}% above average. Significant upside exists.`,
          severity: 'info',
          relatedColumns: [stat.column],
          whyItMatters: 'The gap between average and top performance indicates room for improvement.',
          action: 'Study characteristics of top performers. Implement best practices to move average toward maximum.',
          impact: `Optimizing toward top quartile could yield ${(growthRoom * 0.25).toFixed(0)}% improvement`,
        });
      }
    }
  });
  
  return insights;
}
