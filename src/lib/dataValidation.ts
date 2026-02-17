import { DataSet, StatSummary, ChartConfig } from '@/types/analytics';

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
  confidence: number; // 0-100
}

export interface DataQualityReport {
  overall: ValidationResult;
  statistics: ValidationResult;
  visualizations: ValidationResult;
  correlations: ValidationResult;
  completeness: number;
  accuracy: number;
  consistency: number;
}

/**
 * Comprehensive data validation to ensure accuracy of analysis and visualizations
 */
export class DataValidator {
  
  /**
   * Validate the entire dataset and analysis pipeline
   */
  static validateDataset(dataset: DataSet, stats: StatSummary[], charts: ChartConfig[]): DataQualityReport {
    const dataValidation = this.validateDataIntegrity(dataset);
    const statsValidation = this.validateStatistics(dataset, stats);
    const chartsValidation = this.validateVisualizations(dataset, charts);
    const correlationValidation = this.validateCorrelations(dataset, charts);
    
    const overallConfidence = Math.min(
      dataValidation.confidence,
      statsValidation.confidence,
      chartsValidation.confidence,
      correlationValidation.confidence
    );
    
    return {
      overall: {
        isValid: dataValidation.isValid && statsValidation.isValid && chartsValidation.isValid,
        warnings: [...dataValidation.warnings, ...statsValidation.warnings, ...chartsValidation.warnings],
        errors: [...dataValidation.errors, ...statsValidation.errors, ...chartsValidation.errors],
        recommendations: [...dataValidation.recommendations, ...statsValidation.recommendations, ...chartsValidation.recommendations],
        confidence: overallConfidence
      },
      statistics: statsValidation,
      visualizations: chartsValidation,
      correlations: correlationValidation,
      completeness: this.calculateCompleteness(dataset),
      accuracy: this.calculateAccuracy(dataset, stats),
      consistency: this.calculateConsistency(dataset)
    };
  }
  
  /**
   * Validate data integrity and quality
   */
  private static validateDataIntegrity(dataset: DataSet): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    const recommendations: string[] = [];
    let confidence = 100;
    
    // Check sample size
    if (dataset.rowCount < 30) {
      warnings.push(`Small sample size (${dataset.rowCount} rows). Results may not be statistically significant.`);
      recommendations.push('Collect more data for reliable statistical analysis (minimum 30 rows recommended).');
      confidence -= 20;
    } else if (dataset.rowCount < 100) {
      warnings.push(`Limited sample size (${dataset.rowCount} rows). Consider collecting more data for robust analysis.`);
      confidence -= 10;
    }
    
    // Check for missing data
    const totalCells = dataset.rowCount * dataset.columns.length;
    const missingCells = dataset.columns.reduce((sum, col) => sum + (col.nullCount || 0), 0);
    const missingPercentage = (missingCells / totalCells) * 100;
    
    if (missingPercentage > 30) {
      errors.push(`High missing data rate (${missingPercentage.toFixed(1)}%). Analysis reliability is compromised.`);
      recommendations.push('Address missing data through imputation, collection, or column removal before analysis.');
      confidence -= 30;
    } else if (missingPercentage > 10) {
      warnings.push(`Moderate missing data (${missingPercentage.toFixed(1)}%). Consider data imputation strategies.`);
      confidence -= 15;
    }
    
    // Check column types and consistency
    dataset.columns.forEach(col => {
      if (col.type === 'number') {
        const numericValues = dataset.rows.map(row => Number(row[col.name])).filter(v => !isNaN(v));
        const invalidCount = dataset.rowCount - numericValues.length - (col.nullCount || 0);
        
        if (invalidCount > 0) {
          warnings.push(`Column "${col.name}" has ${invalidCount} non-numeric values despite being classified as numeric.`);
          recommendations.push(`Clean "${col.name}" column by removing or converting non-numeric values.`);
          confidence -= 5;
        }
      }
    });
    
    // Check for duplicate rows
    const uniqueRows = new Set(dataset.rows.map(row => JSON.stringify(row)));
    const duplicateCount = dataset.rowCount - uniqueRows.size;
    if (duplicateCount > 0) {
      warnings.push(`Found ${duplicateCount} duplicate rows (${((duplicateCount / dataset.rowCount) * 100).toFixed(1)}%).`);
      recommendations.push('Remove duplicate rows to avoid skewed analysis results.');
      confidence -= Math.min(duplicateCount / dataset.rowCount * 20, 15);
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      recommendations,
      confidence: Math.max(confidence, 0)
    };
  }
  
  /**
   * Validate statistical calculations
   */
  private static validateStatistics(dataset: DataSet, stats: StatSummary[]): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    const recommendations: string[] = [];
    let confidence = 100;
    
    stats.forEach(stat => {
      const column = dataset.columns.find(c => c.name === stat.column);
      if (!column) {
        errors.push(`Statistics calculated for non-existent column: ${stat.column}`);
        confidence -= 20;
        return;
      }
      
      if (column.type === 'number' && stat.mean !== undefined) {
        // Validate numeric statistics
        const values = dataset.rows.map(row => Number(row[stat.column])).filter(v => !isNaN(v));
        
        // Recalculate mean to verify
        const actualMean = values.reduce((a, b) => a + b, 0) / values.length;
        const meanDiff = Math.abs(actualMean - stat.mean) / Math.abs(actualMean || 1);
        
        if (meanDiff > 0.01) { // 1% tolerance
          errors.push(`Mean calculation error for ${stat.column}. Expected: ${actualMean.toFixed(3)}, Got: ${stat.mean}`);
          confidence -= 15;
        }
        
        // Validate standard deviation
        if (stat.std !== undefined) {
          const variance = values.reduce((sum, v) => sum + Math.pow(v - actualMean, 2), 0) / values.length;
          const actualStd = Math.sqrt(variance);
          const stdDiff = Math.abs(actualStd - stat.std) / Math.abs(actualStd || 1);
          
          if (stdDiff > 0.01) {
            errors.push(`Standard deviation calculation error for ${stat.column}. Expected: ${actualStd.toFixed(3)}, Got: ${stat.std}`);
            confidence -= 15;
          }
        }
        
        // Check for statistical anomalies
        if (stat.std !== undefined && stat.mean !== undefined) {
          const cv = (stat.std / Math.abs(stat.mean || 1)) * 100;
          if (cv > 200) {
            warnings.push(`Extremely high coefficient of variation (${cv.toFixed(1)}%) in ${stat.column}. Check for outliers.`);
            recommendations.push(`Investigate extreme values in ${stat.column}. Consider outlier removal or data transformation.`);
            confidence -= 10;
          }
        }
        
        // Validate range
        if (stat.min !== undefined && stat.max !== undefined && stat.min > stat.max) {
          errors.push(`Invalid range for ${stat.column}: min (${stat.min}) > max (${stat.max})`);
          confidence -= 20;
        }
      }
      
      // Validate counts
      const expectedCount = dataset.rowCount - (stat.nullCount || 0);
      if (stat.count !== expectedCount) {
        warnings.push(`Count mismatch for ${stat.column}. Expected: ${expectedCount}, Got: ${stat.count}`);
        confidence -= 5;
      }
    });
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      recommendations,
      confidence: Math.max(confidence, 0)
    };
  }
  
  /**
   * Validate chart data accuracy
   */
  private static validateVisualizations(dataset: DataSet, charts: ChartConfig[]): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    const recommendations: string[] = [];
    let confidence = 100;
    
    charts.forEach((chart, index) => {
      // Validate chart data integrity
      if (!chart.data || chart.data.length === 0) {
        errors.push(`Chart ${index + 1} (${chart.title}) has no data`);
        confidence -= 20;
        return;
      }
      
      // Validate data consistency with source
      if (chart.type === 'bar' || chart.type === 'pie') {
        const totalChartValue = chart.data.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
        
        if (chart.xAxis && dataset.columns.find(c => c.name === chart.xAxis)) {
          const sourceValues = dataset.rows.map(row => row[chart.xAxis!]).filter(v => v !== null && v !== undefined);
          
          // For categorical data, check if totals match
          if (totalChartValue > sourceValues.length * 1.1) {
            warnings.push(`Chart "${chart.title}" total (${totalChartValue}) exceeds source data count (${sourceValues.length})`);
            confidence -= 10;
          }
        }
      }
      
      // Validate correlation charts
      if (chart.type === 'correlation') {
        if (!chart.correlation || !chart.regression) {
          errors.push(`Correlation chart "${chart.title}" missing correlation or regression data`);
          confidence -= 15;
        } else {
          // Validate correlation coefficient range
          const r = chart.correlation.value;
          if (r < -1 || r > 1) {
            errors.push(`Invalid correlation coefficient (${r}) in chart "${chart.title}". Must be between -1 and 1.`);
            confidence -= 20;
          }
          
          // Validate R-squared
          const rSquared = chart.regression.rSquared;
          if (rSquared < 0 || rSquared > 1) {
            errors.push(`Invalid R-squared value (${rSquared}) in chart "${chart.title}". Must be between 0 and 1.`);
            confidence -= 20;
          }
          
          // Check consistency between correlation and R-squared
          const expectedRSquared = Math.pow(Math.abs(r), 2);
          const rSquaredDiff = Math.abs(expectedRSquared - rSquared);
          if (rSquaredDiff > 0.05) {
            warnings.push(`R-squared (${rSquared.toFixed(3)}) doesn't match correlation² (${expectedRSquared.toFixed(3)}) in "${chart.title}"`);
            confidence -= 10;
          }
        }
      }
      
      // Validate histogram data
      if (chart.type === 'histogram') {
        const binTotal = chart.data.reduce((sum: number, bin: any) => sum + (bin.value || 0), 0);
        const sourceColumn = dataset.columns.find(c => c.name === chart.xAxis);
        
        if (sourceColumn && sourceColumn.type === 'number') {
          const numericValues = dataset.rows.map(row => Number(row[chart.xAxis!])).filter(v => !isNaN(v));
          
          if (Math.abs(binTotal - numericValues.length) > numericValues.length * 0.1) {
            warnings.push(`Histogram "${chart.title}" bin total (${binTotal}) doesn't match source data count (${numericValues.length})`);
            confidence -= 10;
          }
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      recommendations,
      confidence: Math.max(confidence, 0)
    };
  }
  
  /**
   * Validate correlation calculations
   */
  private static validateCorrelations(dataset: DataSet, charts: ChartConfig[]): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    const recommendations: string[] = [];
    let confidence = 100;
    
    const correlationCharts = charts.filter(c => c.type === 'correlation');
    
    correlationCharts.forEach(chart => {
      if (!chart.xAxis || !chart.yAxis) {
        errors.push(`Correlation chart "${chart.title}" missing axis definitions`);
        confidence -= 20;
        return;
      }
      
      const xValues = dataset.rows.map(row => Number(row[chart.xAxis!])).filter(v => !isNaN(v));
      const yValues = dataset.rows.map(row => Number(row[chart.yAxis!])).filter(v => !isNaN(v));
      
      // Check sample size for correlation
      const validPairs = Math.min(xValues.length, yValues.length);
      if (validPairs < 10) {
        warnings.push(`Insufficient data points (${validPairs}) for reliable correlation in "${chart.title}". Minimum 10 recommended.`);
        recommendations.push('Collect more data or remove missing values to improve correlation reliability.');
        confidence -= 20;
      } else if (validPairs < 30) {
        warnings.push(`Limited data points (${validPairs}) for correlation in "${chart.title}". Results may be unstable.`);
        confidence -= 10;
      }
      
      // Validate correlation strength interpretation
      if (chart.correlation) {
        const r = Math.abs(chart.correlation.value);
        const strength = chart.correlation.strength;
        
        const expectedStrength = r >= 0.7 ? 'strong' : r >= 0.4 ? 'moderate' : r >= 0.2 ? 'weak' : 'none';
        if (strength !== expectedStrength) {
          warnings.push(`Correlation strength classification may be incorrect for "${chart.title}". |r|=${r.toFixed(3)} suggests "${expectedStrength}" not "${strength}"`);
          confidence -= 5;
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      recommendations,
      confidence: Math.max(confidence, 0)
    };
  }
  
  /**
   * Calculate data completeness percentage
   */
  private static calculateCompleteness(dataset: DataSet): number {
    const totalCells = dataset.rowCount * dataset.columns.length;
    const missingCells = dataset.columns.reduce((sum, col) => sum + (col.nullCount || 0), 0);
    return Math.max(0, ((totalCells - missingCells) / totalCells) * 100);
  }
  
  /**
   * Calculate data accuracy score based on validation results
   */
  private static calculateAccuracy(dataset: DataSet, stats: StatSummary[]): number {
    let accuracy = 100;
    
    // Penalize for data type inconsistencies
    dataset.columns.forEach(col => {
      if (col.type === 'number') {
        const values = dataset.rows.map(row => row[col.name]);
        const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
        const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
        
        if (numericValues.length < nonNullValues.length) {
          const inconsistencyRate = ((nonNullValues.length - numericValues.length) / nonNullValues.length) * 100;
          accuracy -= inconsistencyRate * 0.5; // Penalize inconsistencies
        }
      }
    });
    
    // Penalize for statistical anomalies
    stats.forEach(stat => {
      if (stat.std !== undefined && stat.mean !== undefined && stat.mean !== 0) {
        const cv = (stat.std / Math.abs(stat.mean)) * 100;
        if (cv > 300) { // Extremely high variability
          accuracy -= 10;
        } else if (cv > 200) {
          accuracy -= 5;
        }
      }
    });
    
    return Math.max(0, accuracy);
  }
  
  /**
   * Calculate data consistency score
   */
  private static calculateConsistency(dataset: DataSet): number {
    let consistency = 100;
    
    // Check for duplicate rows
    const uniqueRows = new Set(dataset.rows.map(row => JSON.stringify(row)));
    const duplicateRate = ((dataset.rowCount - uniqueRows.size) / dataset.rowCount) * 100;
    consistency -= duplicateRate;
    
    // Check for consistent data types within columns
    dataset.columns.forEach(col => {
      const values = dataset.rows.map(row => row[col.name]).filter(v => v !== null && v !== undefined && v !== '');
      const types = new Set(values.map(v => typeof v));
      
      if (types.size > 1) {
        consistency -= 5; // Mixed types in column
      }
    });
    
    return Math.max(0, consistency);
  }
  
  /**
   * Generate validation summary report
   */
  static generateValidationReport(report: DataQualityReport): string {
    let summary = `## Data Quality Assessment\n\n`;
    
    summary += `**Overall Confidence:** ${report.overall.confidence.toFixed(1)}%\n`;
    summary += `**Data Completeness:** ${report.completeness.toFixed(1)}%\n`;
    summary += `**Data Accuracy:** ${report.accuracy.toFixed(1)}%\n`;
    summary += `**Data Consistency:** ${report.consistency.toFixed(1)}%\n\n`;
    
    if (report.overall.errors.length > 0) {
      summary += `### Critical Issues (${report.overall.errors.length})\n`;
      report.overall.errors.forEach((error, i) => {
        summary += `${i + 1}. ❌ ${error}\n`;
      });
      summary += '\n';
    }
    
    if (report.overall.warnings.length > 0) {
      summary += `### Warnings (${report.overall.warnings.length})\n`;
      report.overall.warnings.forEach((warning, i) => {
        summary += `${i + 1}. ⚠️ ${warning}\n`;
      });
      summary += '\n';
    }
    
    if (report.overall.recommendations.length > 0) {
      summary += `### Recommendations (${report.overall.recommendations.length})\n`;
      report.overall.recommendations.forEach((rec, i) => {
        summary += `${i + 1}. 💡 ${rec}\n`;
      });
      summary += '\n';
    }
    
    summary += `### Quality Scores\n`;
    summary += `- **Statistics Confidence:** ${report.statistics.confidence.toFixed(1)}%\n`;
    summary += `- **Visualization Accuracy:** ${report.visualizations.confidence.toFixed(1)}%\n`;
    summary += `- **Correlation Reliability:** ${report.correlations.confidence.toFixed(1)}%\n`;
    
    return summary;
  }
}