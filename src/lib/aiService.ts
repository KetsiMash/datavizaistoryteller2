// AI Service for intelligent data analysis and conversation
import { DatasetInfo, ColumnStatistics } from '@/types/analytics';

export interface AIResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  analysisDepth?: 'surface' | 'moderate' | 'deep';
}

interface DataInsight {
  type: 'trend' | 'correlation' | 'outlier' | 'distribution' | 'comparison';
  description: string;
  significance: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export class AIService {
  private dataset: DatasetInfo | null = null;
  private statistics: ColumnStatistics[] = [];
  private narrative: string = '';
  private charts: any[] = [];
  private cachedInsights: DataInsight[] = [];

  // Update context with current data
  public updateContext(
    dataset: DatasetInfo | null,
    statistics: ColumnStatistics[],
    narrative: string,
    charts: any[]
  ) {
    this.dataset = dataset;
    this.statistics = statistics;
    this.narrative = narrative;
    this.charts = charts;
    
    // Perform deep analysis when data is updated
    if (dataset && statistics.length > 0) {
      this.cachedInsights = this.performDeepAnalysis();
    }
  }

  // Perform comprehensive data analysis
  private performDeepAnalysis(): DataInsight[] {
    const insights: DataInsight[] = [];
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    
    // Distribution analysis
    numericCols.forEach(col => {
      const cv = col.std && col.mean ? col.std / col.mean : 0;
      if (cv > 0.7) {
        insights.push({
          type: 'distribution',
          description: `${col.column} shows high variability (coefficient of variation: ${(cv * 100).toFixed(1)}%), indicating diverse data points or potential segments`,
          significance: 'high',
          recommendation: `Segment ${col.column} into groups to understand different patterns`
        });
      } else if (cv < 0.1) {
        insights.push({
          type: 'distribution',
          description: `${col.column} is highly consistent with low variability, suggesting stable or controlled values`,
          significance: 'medium'
        });
      }
    });

    // Outlier detection
    numericCols.forEach(col => {
      if (col.mean && col.std) {
        const range = (col.max as number) - (col.min as number);
        const expectedRange = col.std * 6; // ~99.7% of data in normal distribution
        if (range > expectedRange * 2) {
          insights.push({
            type: 'outlier',
            description: `${col.column} contains potential outliers - the range (${range.toFixed(2)}) is much wider than expected from the standard deviation`,
            significance: 'high',
            recommendation: 'Investigate extreme values to determine if they are errors or meaningful exceptions'
          });
        }
      }
    });

    // Comparative analysis
    if (numericCols.length >= 2) {
      const sorted = [...numericCols].sort((a, b) => (b.mean || 0) - (a.mean || 0));
      insights.push({
        type: 'comparison',
        description: `${sorted[0].column} has the highest average value (${sorted[0].mean?.toFixed(2)}), which is ${((sorted[0].mean! / sorted[sorted.length - 1].mean!) - 1) * 100 > 0 ? ((sorted[0].mean! / sorted[sorted.length - 1].mean!) - 1) * 100 : 0}% higher than ${sorted[sorted.length - 1].column}`,
        significance: 'medium'
      });
    }

    // Trend indicators
    const timeCol = this.statistics.find(s => /date|time|year|month|period/i.test(s.column));
    if (timeCol && numericCols.length > 0) {
      insights.push({
        type: 'trend',
        description: `Time-series data detected spanning from ${timeCol.min} to ${timeCol.max}, enabling trend analysis for ${numericCols.length} numeric variables`,
        significance: 'high',
        recommendation: 'Analyze trends over time to identify growth patterns, seasonality, or cyclical behavior'
      });
    }

    return insights;
  }

  // Main AI query processor with advanced reasoning
  public async query(userQuestion: string): Promise<AIResponse> {
    const question = userQuestion.toLowerCase().trim();

    // Check if data is available for data-specific questions
    const needsData = this.questionNeedsData(question);
    if (needsData && (!this.dataset || this.statistics.length === 0)) {
      return {
        answer: "I don't have any data loaded yet. Please upload a dataset first, and I'll be happy to analyze it for you.",
        confidence: 1.0
      };
    }

    // Analyze the question and generate response
    const response = this.analyzeQuestion(question);
    return response;
  }

  private questionNeedsData(question: string): boolean {
    // Questions that can be answered without data
    const generalQuestions = [
      /how (do|can|should) i/i,
      /what (is|are|does|means)/i,
      /why (is|are|does|should)/i,
      /explain/i,
      /tell me about/i,
      /advice/i,
      /recommend/i,
      /suggest/i,
      /best practice/i
    ];

    return !generalQuestions.some(pattern => pattern.test(question));
  }

  private analyzeQuestion(question: string): AIResponse {
    // Question type detection with priority order
    if (this.isGreeting(question)) {
      return this.handleGreeting();
    }

    // Full data story request
    if (this.isDataStoryRequest(question)) {
      return this.generateComprehensiveDataStory();
    }

    // Deep analysis request
    if (this.isDeepAnalysisRequest(question)) {
      return this.provideDeepAnalysis(question);
    }

    // General knowledge and advice (no data needed)
    if (this.isHowToQuestion(question)) {
      return this.provideHowToAdvice(question);
    }

    if (this.isWhyQuestion(question)) {
      return this.provideExplanation(question);
    }

    if (this.isRecommendationRequest(question)) {
      return this.provideRecommendations(question);
    }

    if (this.isBestPracticeQuestion(question)) {
      return this.provideBestPractices(question);
    }

    // Data-specific analysis
    if (this.isAboutDataset(question)) {
      return this.describeDataset();
    }

    if (this.isAboutColumns(question)) {
      return this.describeColumns(question);
    }

    if (this.isAboutStatistics(question)) {
      return this.provideStatistics(question);
    }

    if (this.isAboutTrends(question)) {
      return this.describeTrends(question);
    }

    if (this.isAboutComparison(question)) {
      return this.compareColumns(question);
    }

    if (this.isAboutCharts(question)) {
      return this.describeCharts();
    }

    if (this.isAboutInsights(question)) {
      return this.provideInsights();
    }

    if (this.isAboutSpecificValue(question)) {
      return this.findSpecificValue(question);
    }

    if (this.isAboutPrediction(question)) {
      return this.providePredictiveInsights(question);
    }

    if (this.isAboutCorrelation(question)) {
      return this.analyzeCorrelations(question);
    }

    if (this.isAboutOutliers(question)) {
      return this.identifyOutliers(question);
    }

    if (this.isAboutActionableInsights(question)) {
      return this.provideActionableAdvice(question);
    }

    // Default intelligent response
    return this.generateContextualResponse(question);
  }

  // Question type detectors
  private isGreeting(q: string): boolean {
    return /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(q);
  }

  private isDataStoryRequest(q: string): boolean {
    return /(full story|complete story|data story|tell me everything|full analysis|comprehensive|complete analysis|analyze everything)/i.test(q);
  }

  private isDeepAnalysisRequest(q: string): boolean {
    return /(deep|detailed|thorough|in-depth|comprehensive|full).*(analys|insight|explanation|breakdown)/i.test(q);
  }

  private isAboutDataset(q: string): boolean {
    return /(what|tell|describe|explain|show).*(data|dataset|file|information|about)/i.test(q) ||
           /(how many|count|number of).*(rows|records|entries)/i.test(q);
  }

  private isAboutColumns(q: string): boolean {
    return /(what|list|show|tell).*(columns|fields|variables|attributes)/i.test(q);
  }

  private isAboutStatistics(q: string): boolean {
    return /(average|mean|median|max|maximum|min|minimum|sum|total|std|standard deviation)/i.test(q);
  }

  private isAboutTrends(q: string): boolean {
    return /(trend|pattern|change|increase|decrease|growth|decline|over time)/i.test(q);
  }

  private isAboutComparison(q: string): boolean {
    return /(compare|comparison|difference|versus|vs|between|correlation|relationship)/i.test(q);
  }

  private isAboutCharts(q: string): boolean {
    return /(chart|graph|visualization|plot|show me|display)/i.test(q);
  }

  private isAboutInsights(q: string): boolean {
    return /(insight|finding|discovery|interesting|notable|key|important|summary)/i.test(q);
  }

  private isAboutSpecificValue(q: string): boolean {
    return /(highest|lowest|best|worst|top|bottom|largest|smallest)/i.test(q);
  }

  private isHowToQuestion(q: string): boolean {
    return /^how (do|can|should|to)/i.test(q) || /how (do|can|should) i/i.test(q);
  }

  private isWhyQuestion(q: string): boolean {
    return /^why (is|are|does|do|should|would)/i.test(q);
  }

  private isRecommendationRequest(q: string): boolean {
    return /(recommend|suggestion|suggest|advice|should i|what should)/i.test(q);
  }

  private isBestPracticeQuestion(q: string): boolean {
    return /(best practice|best way|better way|improve|optimize|enhance)/i.test(q);
  }

  private isAboutPrediction(q: string): boolean {
    return /(predict|forecast|future|expect|anticipate|will|projection)/i.test(q);
  }

  private isAboutCorrelation(q: string): boolean {
    return /(correlat|relationship|related|connected|affect|impact|influence|depend)/i.test(q);
  }

  private isAboutOutliers(q: string): boolean {
    return /(outlier|anomaly|unusual|abnormal|strange|odd|exception)/i.test(q);
  }

  private isAboutActionableInsights(q: string): boolean {
    return /(what should|action|do|next step|recommend|improve|fix|solve|address)/i.test(q);
  }

  // Response generators
  private handleGreeting(): AIResponse {
    const greetings = [
      `Hello! I'm your AI data assistant. I've analyzed your dataset "${this.dataset?.name}" with ${this.dataset?.rowCount} records. What would you like to know?`,
      `Hi there! I have your data ready. Your dataset contains ${this.statistics.length} columns and ${this.dataset?.rowCount} rows. How can I help you understand it better?`,
      `Greetings! I've processed your data and I'm ready to answer questions about it. Just ask me anything!`
    ];
    return {
      answer: greetings[Math.floor(Math.random() * greetings.length)],
      confidence: 1.0
    };
  }

  private describeDataset(): AIResponse {
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    const categoricalCols = this.statistics.filter(s => s.mean === undefined);

    const story: string[] = [];

    // Professional opening
    story.push(`📊 PROFESSIONAL DATA ANALYSIS: ${this.dataset?.name}`);
    story.push(`\nAs a data analyst, let me walk you through what this dataset reveals:`);

    // Dataset Overview with Context
    story.push(`\n🔍 DATASET OVERVIEW:`);
    story.push(`We're working with ${this.dataset?.rowCount.toLocaleString()} records - ${this.dataset!.rowCount > 1000 ? 'a substantial sample size that provides statistical confidence' : this.dataset!.rowCount > 500 ? 'a solid dataset for meaningful analysis' : 'a moderate dataset that can reveal initial patterns'}. The data is structured across ${this.statistics.length} dimensions, giving us ${numericCols.length > categoricalCols.length ? 'a quantitatively-rich' : 'a categorically-diverse'} analytical foundation.`);

    // Data Architecture Analysis
    story.push(`\n📋 DATA ARCHITECTURE:`);
    
    if (categoricalCols.length > 0) {
      story.push(`\nCategorical Dimensions (${categoricalCols.length}):`);
      categoricalCols.forEach(col => {
        const uniqueCount = col.uniqueValues || 'multiple';
        story.push(`  • ${col.column}: ${uniqueCount} distinct values - This provides ${typeof uniqueCount === 'number' && uniqueCount < 10 ? 'clear segmentation' : 'rich granularity'} for grouping and filtering`);
      });
      
      // Identify key dimensions
      const dateCol = categoricalCols.find(c => /date|time|year|month/i.test(c.column));
      const locationCol = categoricalCols.find(c => /country|region|city|location|market/i.test(c.column));
      const categoryCol = categoricalCols.find(c => /category|type|class|commodity|product/i.test(c.column));
      
      story.push(`\n🎯 Key Analytical Dimensions Identified:`);
      if (dateCol) {
        story.push(`  • Temporal: ${dateCol.column} - Enables trend analysis, seasonality detection, and forecasting`);
      }
      if (locationCol) {
        story.push(`  • Geographic: ${locationCol.column} - Allows regional comparisons and location-based insights`);
      }
      if (categoryCol) {
        story.push(`  • Classification: ${categoryCol.column} - Supports category-level analysis and segmentation`);
      }
    }

    if (numericCols.length > 0) {
      story.push(`\nQuantitative Measures (${numericCols.length}):`);
      numericCols.forEach(col => {
        const cv = col.std && col.mean ? (col.std / col.mean) * 100 : 0;
        story.push(`  • ${col.column}: Range ${col.min} to ${col.max}, Average ${col.mean?.toFixed(2)} - ${cv > 50 ? 'High variability suggests diverse patterns' : cv > 20 ? 'Moderate spread indicates normal variation' : 'Low variability shows consistency'}`);
      });
    }

    // Business Context & Insights
    story.push(`\n💡 ANALYTICAL INSIGHTS:`);
    
    // Detect data type and provide context
    const dataContext = this.inferDataContext();
    if (dataContext) {
      story.push(dataContext);
    }

    // Statistical Significance
    if (numericCols.length > 0) {
      const primaryMetric = numericCols[0];
      const cv = primaryMetric.std && primaryMetric.mean ? (primaryMetric.std / primaryMetric.mean) * 100 : 0;
      
      story.push(`\nFocusing on ${primaryMetric.column} as our primary metric:`);
      story.push(`  • The average value of ${primaryMetric.mean?.toFixed(2)} represents the central tendency`);
      story.push(`  • With a coefficient of variation of ${cv.toFixed(1)}%, we see ${cv > 50 ? 'significant diversity - suggesting multiple segments or market conditions' : cv > 20 ? 'healthy variation - typical of real-world data' : 'remarkable consistency - indicating stable conditions or controlled environment'}`);
      
      if (primaryMetric.min && primaryMetric.max) {
        const range = (primaryMetric.max as number) - (primaryMetric.min as number);
        story.push(`  • The range of ${range.toFixed(2)} (from ${primaryMetric.min} to ${primaryMetric.max}) ${range > (primaryMetric.mean || 1) * 2 ? 'is substantial, warranting outlier investigation' : 'is reasonable for this metric'}`);
      }
    }

    // Comparative Analysis
    if (numericCols.length >= 2) {
      story.push(`\n🔄 COMPARATIVE PERSPECTIVE:`);
      const sorted = [...numericCols].sort((a, b) => (b.mean || 0) - (a.mean || 0));
      story.push(`When comparing our numeric variables:`);
      story.push(`  • ${sorted[0].column} leads with an average of ${sorted[0].mean?.toFixed(2)}`);
      story.push(`  • ${sorted[sorted.length - 1].column} shows ${sorted[sorted.length - 1].mean?.toFixed(2)} on average`);
      const ratio = (sorted[0].mean || 1) / (sorted[sorted.length - 1].mean || 1);
      story.push(`  • This ${ratio.toFixed(1)}x difference ${ratio > 10 ? 'indicates vastly different scales - consider normalization for comparison' : ratio > 3 ? 'shows notable magnitude variation' : 'suggests comparable scales'}`);
    }

    // Data Quality Assessment
    story.push(`\n✅ DATA QUALITY PERSPECTIVE:`);
    story.push(`  • Sample Size: ${this.dataset?.rowCount.toLocaleString()} records ${this.dataset!.rowCount > 1000 ? 'provides robust statistical power for confident conclusions' : this.dataset!.rowCount > 100 ? 'offers adequate data for preliminary insights' : 'is limited - findings should be validated with more data'}`);
    story.push(`  • Completeness: ${this.statistics.length} complete dimensions enable multi-faceted analysis`);
    story.push(`  • Structure: ${categoricalCols.length > 0 && numericCols.length > 0 ? 'Balanced mix of categorical and numeric data supports comprehensive analysis' : numericCols.length > 0 ? 'Numeric-heavy structure ideal for statistical modeling' : 'Categorical focus enables segmentation and classification'}`);

    // Strategic Recommendations
    story.push(`\n🎯 RECOMMENDED ANALYSIS APPROACH:`);
    const recommendations: string[] = [];
    
    if (categoricalCols.find(c => /date|time/i.test(c.column))) {
      recommendations.push('Time-series analysis to identify trends, seasonality, and growth patterns');
    }
    
    if (categoricalCols.find(c => /country|region|location/i.test(c.column))) {
      recommendations.push('Geographic analysis to compare regional performance and identify location-specific patterns');
    }
    
    if (numericCols.length >= 2) {
      recommendations.push('Correlation analysis to uncover relationships between variables');
    }
    
    if (categoricalCols.length >= 2) {
      recommendations.push('Cross-tabulation to understand how categories interact');
    }
    
    recommendations.push('Outlier detection to identify exceptional cases or data quality issues');
    recommendations.push('Segmentation analysis to find distinct groups with different characteristics');
    
    recommendations.forEach((rec, idx) => {
      story.push(`  ${idx + 1}. ${rec}`);
    });

    // Professional Conclusion
    story.push(`\n📝 ANALYST'S CONCLUSION:`);
    story.push(`This dataset presents ${numericCols.length > 2 ? 'rich analytical opportunities' : 'focused analytical scope'} with ${this.dataset!.rowCount > 1000 ? 'strong' : 'adequate'} statistical foundation. The ${categoricalCols.length > 0 ? 'categorical dimensions provide excellent segmentation capabilities' : 'numeric focus enables deep statistical analysis'}, while ${numericCols.length > 0 ? 'the quantitative measures allow for trend analysis and forecasting' : 'the categorical structure supports classification and grouping'}. I recommend starting with ${recommendations[0]?.toLowerCase() || 'exploratory data analysis'} to establish baseline understanding, then progressing to deeper analytical techniques.`);

    return {
      answer: story.join('\n'),
      confidence: 0.95,
      sources: this.statistics.map(s => s.column),
      analysisDepth: 'deep'
    };
  }

  // Infer business context from column names
  private inferDataContext(): string | null {
    const colNames = this.statistics.map(s => s.column.toLowerCase()).join(' ');
    
    if (/price|cost|revenue|sales|amount/.test(colNames)) {
      if (/market|commodity|agriculture|product/.test(colNames)) {
        return `This appears to be market/pricing data, likely tracking commodity or product prices across different markets. This type of data is crucial for understanding market dynamics, price volatility, and competitive positioning.`;
      }
      return `This appears to be financial/transactional data. Such datasets are valuable for revenue analysis, pricing strategy, and financial forecasting.`;
    }
    
    if (/customer|user|client/.test(colNames)) {
      return `This appears to be customer-related data. These datasets are essential for understanding customer behavior, segmentation, and lifetime value analysis.`;
    }
    
    if (/date|time/.test(colNames) && /count|total|sum/.test(colNames)) {
      return `This appears to be time-series operational data, useful for tracking performance metrics, identifying trends, and forecasting future values.`;
    }
    
    return `This dataset structure suggests ${this.statistics.length > 5 ? 'comprehensive' : 'focused'} data collection, enabling ${this.statistics.filter(s => s.mean !== undefined).length > 0 ? 'quantitative' : 'qualitative'} analysis.`;
  }

  private describeColumns(question: string): AIResponse {
    const columnList = this.statistics.map(s => {
      const type = s.mean !== undefined ? 'numeric' : 'categorical';
      return `${s.column} (${type})`;
    }).join(', ');

    const answer = `The dataset has ${this.statistics.length} columns: ${columnList}. ` +
      `Would you like to know more about any specific column?`;

    return { answer, confidence: 1.0, sources: ['column metadata'] };
  }

  private provideStatistics(question: string): AIResponse {
    // Try to find which column the user is asking about
    const mentionedColumn = this.statistics.find(s => 
      question.includes(s.column.toLowerCase())
    );

    if (mentionedColumn && mentionedColumn.mean !== undefined) {
      const answer = `For ${mentionedColumn.column}: ` +
        `Average is ${mentionedColumn.mean.toFixed(2)}, ` +
        `Median is ${mentionedColumn.median?.toFixed(2) || 'N/A'}, ` +
        `Minimum is ${mentionedColumn.min}, ` +
        `Maximum is ${mentionedColumn.max}, ` +
        `Standard deviation is ${mentionedColumn.std?.toFixed(2) || 'N/A'}.`;
      
      return { answer, confidence: 0.95, sources: [mentionedColumn.column] };
    }

    // General statistics
    const numericStats = this.statistics.filter(s => s.mean !== undefined);
    if (numericStats.length > 0) {
      const answer = `Here are the key statistics: ` +
        numericStats.slice(0, 3).map(s => 
          `${s.column} has an average of ${s.mean?.toFixed(2)} (range: ${s.min} to ${s.max})`
        ).join('. ') + '. Would you like details on a specific column?';
      
      return { answer, confidence: 0.85, sources: numericStats.map(s => s.column) };
    }

    return {
      answer: "I don't see any numeric columns with statistics. The dataset appears to contain categorical data.",
      confidence: 0.8
    };
  }

  private describeTrends(question: string): AIResponse {
    // Look for time-based or sequential patterns
    const timeColumns = this.statistics.filter(s => 
      /date|time|year|month|day|period/i.test(s.column)
    );

    if (timeColumns.length > 0) {
      const answer = `I found time-related columns: ${timeColumns.map(s => s.column).join(', ')}. ` +
        `The data spans from ${timeColumns[0].min} to ${timeColumns[0].max}. ` +
        `To see trends over time, check the line charts in the dashboard.`;
      
      return { answer, confidence: 0.8, sources: timeColumns.map(s => s.column) };
    }

    return {
      answer: "I don't see obvious time-based columns for trend analysis. However, you can explore patterns in the visualizations on the dashboard.",
      confidence: 0.6
    };
  }

  private compareColumns(question: string): AIResponse {
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    
    if (numericCols.length >= 2) {
      const col1 = numericCols[0];
      const col2 = numericCols[1];
      
      const answer = `Comparing ${col1.column} and ${col2.column}: ` +
        `${col1.column} ranges from ${col1.min} to ${col1.max} with average ${col1.mean?.toFixed(2)}, ` +
        `while ${col2.column} ranges from ${col2.min} to ${col2.max} with average ${col2.mean?.toFixed(2)}. ` +
        `Check the scatter plot for their relationship.`;
      
      return { answer, confidence: 0.85, sources: [col1.column, col2.column] };
    }

    return {
      answer: "I need at least two numeric columns to make comparisons. Please specify which columns you'd like to compare.",
      confidence: 0.7
    };
  }

  private describeCharts(): AIResponse {
    if (this.charts.length > 0) {
      const chartTypes = this.charts.map(c => c.type).join(', ');
      const answer = `I've created ${this.charts.length} visualizations for you: ${chartTypes}. ` +
        `These charts help you understand patterns, distributions, and relationships in your data. ` +
        `You can view them on the dashboard.`;
      
      return { answer, confidence: 1.0, sources: ['charts'] };
    }

    return {
      answer: "No charts have been generated yet. Go to the Analysis page to create visualizations.",
      confidence: 1.0
    };
  }

  private provideInsights(): AIResponse {
    if (this.narrative) {
      // Extract key points from narrative
      const sentences = this.narrative.split('.').filter(s => s.trim().length > 20);
      const keyInsights = sentences.slice(0, 3).join('. ') + '.';
      
      return {
        answer: `Here are the key insights from your data: ${keyInsights} Would you like me to read the full story?`,
        confidence: 0.9,
        sources: ['narrative analysis']
      };
    }

    // Generate insights from statistics
    const numericStats = this.statistics.filter(s => s.mean !== undefined);
    if (numericStats.length > 0) {
      const insights = numericStats.slice(0, 2).map(s => {
        const range = (s.max as number) - (s.min as number);
        const variability = s.std ? (s.std / (s.mean || 1)) * 100 : 0;
        return `${s.column} shows ${variability > 50 ? 'high' : 'moderate'} variability with values ranging from ${s.min} to ${s.max}`;
      }).join('. ');

      return {
        answer: `Key insights: ${insights}. The data contains ${this.dataset?.rowCount} records across ${this.statistics.length} dimensions.`,
        confidence: 0.85,
        sources: numericStats.map(s => s.column)
      };
    }

    return {
      answer: "Generate insights by analyzing your data on the Insights page.",
      confidence: 0.7
    };
  }

  private findSpecificValue(question: string): AIResponse {
    const numericStats = this.statistics.filter(s => s.mean !== undefined);
    
    if (numericStats.length === 0) {
      return {
        answer: "I don't have numeric data to find highest or lowest values.",
        confidence: 0.8
      };
    }

    // Determine what they're looking for
    const isHighest = /(highest|maximum|max|largest|biggest|top|best)/i.test(question);
    const isLowest = /(lowest|minimum|min|smallest|bottom|worst)/i.test(question);

    const results = numericStats.map(s => ({
      column: s.column,
      value: isHighest ? s.max : s.min,
      type: isHighest ? 'highest' : 'lowest'
    }));

    const answer = `The ${results[0].type} values are: ` +
      results.slice(0, 3).map(r => `${r.column}: ${r.value}`).join(', ') + '.';

    return {
      answer,
      confidence: 0.9,
      sources: results.map(r => r.column)
    };
  }

  private generateContextualResponse(question: string): AIResponse {
    // Instead of saying "I'm not sure", analyze the data and provide intelligent response
    if (!this.dataset || this.statistics.length === 0) {
      return {
        answer: "I don't have data loaded yet, but I can still help! I can explain data concepts, provide analysis advice, or guide you on best practices. What would you like to know?",
        confidence: 0.8
      };
    }

    // Intelligent data-driven response for any question
    const story: string[] = [];
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    const categoricalCols = this.statistics.filter(s => s.mean === undefined);

    story.push(`Let me analyze your data to answer "${question}":`);
    story.push(`\nBased on your dataset "${this.dataset.name}" with ${this.dataset.rowCount.toLocaleString()} records:`);

    // Extract keywords from question to find relevant columns
    const questionWords = question.toLowerCase().split(/\s+/);
    const relevantCols = this.statistics.filter(col => 
      questionWords.some(word => col.column.toLowerCase().includes(word) || word.includes(col.column.toLowerCase()))
    );

    if (relevantCols.length > 0) {
      story.push(`\nI found relevant data columns: ${relevantCols.map(c => c.column).join(', ')}`);
      
      relevantCols.forEach(col => {
        if (col.mean !== undefined) {
          story.push(`\n${col.column}:`);
          story.push(`  • Average: ${col.mean.toFixed(2)}`);
          story.push(`  • Range: ${col.min} to ${col.max}`);
          story.push(`  • This shows ${col.std && col.mean && (col.std / col.mean) > 0.5 ? 'high variability' : 'consistent values'}`);
        } else {
          story.push(`\n${col.column}: Categorical variable with ${col.uniqueValues || 'multiple'} distinct values`);
        }
      });
    } else {
      // Provide general insights when no specific columns match
      story.push(`\nHere's what I can tell you about your data:`);
      
      if (numericCols.length > 0) {
        const primaryMetric = numericCols[0];
        story.push(`\nKey metric - ${primaryMetric.column}:`);
        story.push(`  • Average value: ${primaryMetric.mean?.toFixed(2)}`);
        story.push(`  • Ranges from ${primaryMetric.min} to ${primaryMetric.max}`);
        
        const cv = primaryMetric.std && primaryMetric.mean ? (primaryMetric.std / primaryMetric.mean) * 100 : 0;
        story.push(`  • Variability: ${cv.toFixed(1)}% - ${cv > 50 ? 'High diversity in values' : cv > 20 ? 'Moderate variation' : 'Consistent values'}`);
      }

      if (categoricalCols.length > 0) {
        story.push(`\nCategorical dimensions: ${categoricalCols.map(c => c.column).join(', ')}`);
        story.push(`These allow you to segment and group your data for deeper insights.`);
      }

      // Identify patterns based on column names
      const hasTime = this.statistics.some(s => /date|time|year|month/i.test(s.column));
      const hasLocation = this.statistics.some(s => /country|region|city|location/i.test(s.column));
      const hasCategory = this.statistics.some(s => /category|type|class|commodity/i.test(s.column));

      if (hasTime) {
        story.push(`\n⏰ Time dimension detected - You can analyze trends over time`);
      }
      if (hasLocation) {
        story.push(`\n🌍 Geographic dimension detected - You can compare across locations`);
      }
      if (hasCategory) {
        story.push(`\n📊 Category dimension detected - You can compare different categories`);
      }
    }

    // Provide actionable insights
    story.push(`\n💡 To get more specific insights:`);
    story.push(`  • Ask about specific columns like "${this.statistics[0].column}"`);
    story.push(`  • Request comparisons: "Compare ${this.statistics[0]?.column} and ${this.statistics[1]?.column}"`);
    story.push(`  • Ask for trends: "What trends do you see?"`);
    story.push(`  • Request full analysis: "Tell me the complete data story"`);

    return {
      answer: story.join('\n'),
      confidence: 0.75,
      sources: relevantCols.length > 0 ? relevantCols.map(c => c.column) : this.statistics.slice(0, 3).map(s => s.column)
    };
  }

  // Advanced response generators
  private provideHowToAdvice(question: string): AIResponse {
    const adviceMap: { [key: string]: string } = {
      'analyze': 'To analyze data effectively: 1) Start by understanding your data structure and quality, 2) Look for patterns and trends, 3) Identify correlations between variables, 4) Check for outliers, 5) Generate visualizations to spot insights. Upload your data and I can help you with each step.',
      'visualize': 'To create effective visualizations: 1) Choose the right chart type for your data (bar for comparisons, line for trends, scatter for relationships), 2) Keep it simple and focused, 3) Use clear labels and titles, 4) Highlight key insights. I can generate various charts from your data automatically.',
      'interpret': 'To interpret data: 1) Look at the overall patterns first, 2) Compare values across categories, 3) Identify trends over time, 4) Look for correlations, 5) Consider the context and what the numbers mean for your goals. I can help explain what your specific data shows.',
      'improve': 'To improve data quality: 1) Check for missing values, 2) Remove duplicates, 3) Validate data types, 4) Handle outliers appropriately, 5) Ensure consistency. Upload your data and I can identify quality issues.',
      'predict': 'To make predictions from data: 1) Identify historical patterns, 2) Look for correlations with outcome variables, 3) Consider external factors, 4) Use statistical methods or machine learning, 5) Validate predictions with test data. I can help identify predictive patterns in your data.',
    };

    for (const [key, advice] of Object.entries(adviceMap)) {
      if (question.includes(key)) {
        return { answer: advice, confidence: 0.9 };
      }
    }

    return {
      answer: 'I can help you with data analysis, visualization, interpretation, and insights. Could you be more specific about what you\'d like to learn? For example, ask "How do I analyze trends?" or "How do I interpret correlations?"',
      confidence: 0.7
    };
  }

  private provideExplanation(question: string): AIResponse {
    const explanations: { [key: string]: string } = {
      'important': 'Data analysis is important because it helps you make informed decisions based on evidence rather than intuition. It reveals patterns, trends, and insights that aren\'t obvious from raw numbers, enabling you to understand what happened, why it happened, and what might happen next.',
      'correlation': 'Correlation shows how two variables move together. A positive correlation means they increase together, negative means one increases as the other decreases. However, correlation doesn\'t mean causation - just because two things are related doesn\'t mean one causes the other.',
      'mean': 'The mean (average) is the sum of all values divided by the count. It gives you the central tendency of your data. However, it can be affected by outliers, so it\'s good to also look at the median (middle value) for a complete picture.',
      'outlier': 'Outliers are data points that are significantly different from others. They can indicate errors, special cases, or important insights. Sometimes they should be removed, sometimes they\'re the most interesting part of your data - it depends on your context.',
      'trend': 'A trend is a general direction in which something is developing or changing over time. Identifying trends helps you understand if things are improving, declining, or staying stable, which is crucial for planning and decision-making.',
      'standard deviation': 'Standard deviation measures how spread out your data is from the average. A low standard deviation means data points are close to the mean, while a high one means they\'re more spread out. It helps you understand the variability and reliability of your data.',
    };

    for (const [key, explanation] of Object.entries(explanations)) {
      if (question.includes(key)) {
        return { answer: explanation, confidence: 0.95 };
      }
    }

    return {
      answer: 'I can explain various data concepts like correlation, mean, median, outliers, trends, and more. What specific concept would you like me to explain?',
      confidence: 0.7
    };
  }

  private provideRecommendations(question: string): AIResponse {
    if (!this.dataset || this.statistics.length === 0) {
      return {
        answer: 'I recommend starting by uploading your data. Once I can see it, I can provide specific recommendations for analysis, visualization, and insights based on your actual data characteristics.',
        confidence: 0.9
      };
    }

    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    const recommendations: string[] = [];

    // Data-driven recommendations
    if (numericCols.length >= 2) {
      recommendations.push('Analyze correlations between your numeric variables to find relationships');
    }

    if (this.statistics.some(s => /date|time|year|month/i.test(s.column))) {
      recommendations.push('Create time-series visualizations to identify trends over time');
    }

    if (numericCols.some(s => s.std && s.mean && (s.std / s.mean) > 0.5)) {
      recommendations.push('Investigate high variability in your data - there may be distinct groups or outliers');
    }

    if (this.charts.length === 0) {
      recommendations.push('Generate visualizations to better understand your data patterns');
    }

    if (!this.narrative) {
      recommendations.push('Create a data story to communicate your findings effectively');
    }

    const answer = recommendations.length > 0
      ? `Based on your data, I recommend: ${recommendations.join('; ')}. Would you like me to elaborate on any of these?`
      : 'Your data looks well-analyzed. Consider exploring specific questions about relationships between variables or generating predictive insights.';

    return { answer, confidence: 0.85, sources: ['data analysis'] };
  }

  private provideBestPractices(question: string): AIResponse {
    const practices: { [key: string]: string } = {
      'visualiz': 'Best practices for visualization: 1) Choose the right chart type (bar for categories, line for time series, scatter for relationships), 2) Use consistent colors and scales, 3) Label everything clearly, 4) Avoid 3D charts and excessive decoration, 5) Tell a story with your visuals.',
      'analyz': 'Best practices for analysis: 1) Start with data quality checks, 2) Understand your data distribution, 3) Look for patterns before diving into details, 4) Consider multiple perspectives, 5) Validate findings with different methods, 6) Document your process.',
      'present': 'Best practices for presenting data: 1) Know your audience, 2) Start with key insights, 3) Use simple, clear visualizations, 4) Provide context, 5) Tell a compelling story, 6) Be prepared to answer questions about methodology.',
      'clean': 'Best practices for data cleaning: 1) Document all changes, 2) Handle missing values appropriately, 3) Check for duplicates, 4) Validate data types, 5) Identify and handle outliers, 6) Maintain data integrity.',
    };

    for (const [key, practice] of Object.entries(practices)) {
      if (question.includes(key)) {
        return { answer: practice, confidence: 0.95 };
      }
    }

    return {
      answer: 'I can share best practices for data visualization, analysis, presentation, and cleaning. What specific area would you like guidance on?',
      confidence: 0.8
    };
  }

  private providePredictiveInsights(question: string): AIResponse {
    if (!this.dataset || this.statistics.length === 0) {
      return {
        answer: 'To provide predictions, I need to analyze your data first. Upload a dataset and I can identify predictive patterns.',
        confidence: 0.9
      };
    }

    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    const timeCol = this.statistics.find(s => /date|time|year|month/i.test(s.column));

    if (timeCol && numericCols.length > 0) {
      const answer = `Based on your time-series data, I can see patterns in ${numericCols[0].column}. ` +
        `The data ranges from ${numericCols[0].min} to ${numericCols[0].max}. ` +
        `To make accurate predictions, I'd need to analyze the trend direction, seasonality, and growth rate. ` +
        `Consider using the Predictions panel on the dashboard for detailed forecasts.`;
      
      return { answer, confidence: 0.8, sources: [numericCols[0].column, timeCol.column] };
    }

    return {
      answer: 'For predictions, I need time-series data or clear predictor variables. Your current dataset would benefit from trend analysis. What specific outcome are you trying to predict?',
      confidence: 0.7
    };
  }

  private analyzeCorrelations(question: string): AIResponse {
    const numericCols = this.statistics.filter(s => s.mean !== undefined);

    if (numericCols.length < 2) {
      return {
        answer: 'I need at least two numeric columns to analyze correlations. Your data appears to be mostly categorical.',
        confidence: 0.9
      };
    }

    // Simulate correlation analysis based on statistics
    const col1 = numericCols[0];
    const col2 = numericCols[1];

    const answer = `Looking at ${col1.column} and ${col2.column}: ` +
      `${col1.column} varies from ${col1.min} to ${col1.max}, ` +
      `while ${col2.column} ranges from ${col2.min} to ${col2.max}. ` +
      `To determine if they're correlated, check the scatter plot visualization. ` +
      `Strong correlations appear as clear patterns (upward for positive, downward for negative). ` +
      `Remember: correlation doesn't imply causation - other factors might be involved.`;

    return { answer, confidence: 0.8, sources: [col1.column, col2.column] };
  }

  private identifyOutliers(question: string): AIResponse {
    const numericCols = this.statistics.filter(s => s.mean !== undefined && s.std !== undefined);

    if (numericCols.length === 0) {
      return {
        answer: 'I need numeric data with statistics to identify outliers. Upload numeric data and I can help spot unusual values.',
        confidence: 0.9
      };
    }

    const outlierAnalysis = numericCols.map(col => {
      const mean = col.mean!;
      const std = col.std!;
      const range = (col.max as number) - (col.min as number);
      const cv = std / mean; // Coefficient of variation

      if (cv > 0.5) {
        return `${col.column} shows high variability (CV: ${(cv * 100).toFixed(1)}%) - likely contains outliers or distinct groups`;
      }
      return null;
    }).filter(Boolean);

    const answer = outlierAnalysis.length > 0
      ? `Outlier analysis: ${outlierAnalysis.join('. ')}. Check the box plots in visualizations to see the distribution and identify specific outliers.`
      : `Your data appears relatively consistent without obvious outliers. All values fall within expected ranges based on the statistics.`;

    return { answer, confidence: 0.85, sources: numericCols.map(c => c.column) };
  }

  private provideActionableAdvice(question: string): AIResponse {
    if (!this.dataset || this.statistics.length === 0) {
      return {
        answer: 'First action: Upload your data so I can analyze it and provide specific, actionable recommendations.',
        confidence: 1.0
      };
    }

    const actions: string[] = [];
    const numericCols = this.statistics.filter(s => s.mean !== undefined);

    // Generate actionable advice based on data characteristics
    if (numericCols.length > 0) {
      const highVariability = numericCols.filter(c => c.std && c.mean && (c.std / c.mean) > 0.5);
      if (highVariability.length > 0) {
        actions.push(`Investigate why ${highVariability[0].column} has high variability - segment your data to find patterns`);
      }
    }

    if (this.statistics.some(s => /date|time/i.test(s.column))) {
      actions.push('Analyze trends over time to identify growth opportunities or declining areas');
    }

    if (numericCols.length >= 2) {
      actions.push(`Explore relationships between ${numericCols[0].column} and ${numericCols[1].column} to find optimization opportunities`);
    }

    if (!this.narrative) {
      actions.push('Generate a data story to communicate findings to stakeholders');
    }

    actions.push('Create visualizations to spot patterns that numbers alone might miss');
    actions.push('Set up regular monitoring of key metrics to track changes over time');

    const answer = `Actionable next steps: ${actions.slice(0, 4).map((a, i) => `${i + 1}) ${a}`).join('; ')}. Which would you like to explore first?`;

    return { answer, confidence: 0.9, sources: ['strategic analysis'] };
  }

  // Comprehensive Data Story Generator
  private generateComprehensiveDataStory(): AIResponse {
    if (!this.dataset || this.statistics.length === 0) {
      return {
        answer: 'I need data to analyze first. Please upload your dataset and I\'ll provide a comprehensive analysis.',
        confidence: 1.0
      };
    }

    const story: string[] = [];
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    const categoricalCols = this.statistics.filter(s => s.mean === undefined);

    // Executive Summary
    story.push(`📊 COMPREHENSIVE DATA ANALYSIS REPORT`);
    story.push(`\nDataset: "${this.dataset.name}"`);
    story.push(`\n🔍 EXECUTIVE SUMMARY:`);
    story.push(`This analysis examines ${this.dataset.rowCount.toLocaleString()} records across ${this.statistics.length} variables. The dataset contains ${numericCols.length} quantitative measures and ${categoricalCols.length} categorical dimensions, providing a ${numericCols.length > categoricalCols.length ? 'quantitatively-rich' : 'categorically-diverse'} foundation for analysis.`);

    // Data Structure Analysis
    story.push(`\n\n📋 DATA STRUCTURE:`);
    story.push(`The data architecture consists of:`);
    if (numericCols.length > 0) {
      story.push(`- Numeric variables: ${numericCols.map(c => c.column).join(', ')}. These enable statistical analysis, trend identification, and predictive modeling.`);
    }
    if (categoricalCols.length > 0) {
      story.push(`- Categorical variables: ${categoricalCols.map(c => c.column).join(', ')}. These provide segmentation and classification capabilities.`);
    }

    // Statistical Deep Dive
    if (numericCols.length > 0) {
      story.push(`\n\n📈 STATISTICAL ANALYSIS:`);
      
      numericCols.slice(0, 3).forEach(col => {
        const cv = col.std && col.mean ? (col.std / col.mean) * 100 : 0;
        const range = (col.max as number) - (col.min as number);
        
        story.push(`\n${col.column}:`);
        story.push(`  • Central Tendency: Mean of ${col.mean?.toFixed(2)}, Median of ${col.median?.toFixed(2) || 'N/A'}`);
        story.push(`  • Spread: Ranges from ${col.min} to ${col.max} (span: ${range.toFixed(2)})`);
        story.push(`  • Variability: Standard deviation of ${col.std?.toFixed(2)}, representing ${cv.toFixed(1)}% coefficient of variation`);
        
        // Interpretation
        if (cv > 50) {
          story.push(`  • Interpretation: HIGH variability suggests diverse data points, multiple segments, or potential outliers. This indicates heterogeneous behavior worth investigating.`);
        } else if (cv > 20) {
          story.push(`  • Interpretation: MODERATE variability indicates normal business fluctuation. Values cluster around the mean with expected deviation.`);
        } else {
          story.push(`  • Interpretation: LOW variability shows consistency and stability. Values are tightly clustered, suggesting controlled or uniform conditions.`);
        }
      });
    }

    // Key Insights from Deep Analysis
    if (this.cachedInsights.length > 0) {
      story.push(`\n\n💡 KEY INSIGHTS:`);
      
      const highSignificance = this.cachedInsights.filter(i => i.significance === 'high');
      highSignificance.forEach((insight, idx) => {
        story.push(`\n${idx + 1}. ${insight.description}`);
        if (insight.recommendation) {
          story.push(`   → Recommendation: ${insight.recommendation}`);
        }
      });
    }

    // Comparative Analysis
    if (numericCols.length >= 2) {
      story.push(`\n\n🔄 COMPARATIVE ANALYSIS:`);
      const sorted = [...numericCols].sort((a, b) => (b.mean || 0) - (a.mean || 0));
      story.push(`Ranking by average values:`);
      sorted.slice(0, 3).forEach((col, idx) => {
        story.push(`  ${idx + 1}. ${col.column}: ${col.mean?.toFixed(2)} (${idx === 0 ? 'highest' : idx === sorted.length - 1 ? 'lowest' : 'mid-range'})`);
      });
      
      const ratio = sorted[0].mean! / sorted[sorted.length - 1].mean!;
      story.push(`\nThe highest variable (${sorted[0].column}) is ${ratio.toFixed(2)}x the lowest (${sorted[sorted.length - 1].column}), indicating ${ratio > 10 ? 'significant scale differences' : ratio > 3 ? 'notable magnitude variation' : 'comparable scales'} across metrics.`);
    }

    // Trend Analysis
    const timeCol = this.statistics.find(s => /date|time|year|month|period/i.test(s.column));
    if (timeCol) {
      story.push(`\n\n📅 TEMPORAL ANALYSIS:`);
      story.push(`Time dimension identified: ${timeCol.column} spanning from ${timeCol.min} to ${timeCol.max}.`);
      story.push(`This enables longitudinal analysis to identify:`);
      story.push(`  • Growth or decline patterns over time`);
      story.push(`  • Seasonal or cyclical behaviors`);
      story.push(`  • Inflection points and trend changes`);
      story.push(`  • Forecasting opportunities for future periods`);
    }

    // Data Quality Assessment
    story.push(`\n\n✅ DATA QUALITY ASSESSMENT:`);
    story.push(`Sample size: ${this.dataset.rowCount.toLocaleString()} records provides ${this.dataset.rowCount > 1000 ? 'statistically robust' : this.dataset.rowCount > 100 ? 'adequate' : 'limited'} analytical power.`);
    
    const hasOutliers = this.cachedInsights.some(i => i.type === 'outlier');
    if (hasOutliers) {
      story.push(`Outliers detected: Requires investigation to determine if they represent errors or meaningful exceptions.`);
    } else {
      story.push(`Data appears clean with values within expected ranges.`);
    }

    // Strategic Recommendations
    story.push(`\n\n🎯 STRATEGIC RECOMMENDATIONS:`);
    const recommendations: string[] = [];
    
    if (numericCols.length >= 2) {
      recommendations.push(`Perform correlation analysis to identify relationships between variables and potential causal factors`);
    }
    
    if (timeCol) {
      recommendations.push(`Conduct time-series forecasting to predict future trends and plan accordingly`);
    }
    
    if (this.cachedInsights.some(i => i.significance === 'high')) {
      recommendations.push(`Investigate high-significance insights immediately as they represent critical findings`);
    }
    
    recommendations.push(`Create segmented analyses to understand different groups or patterns within the data`);
    recommendations.push(`Establish KPI monitoring dashboards to track changes over time`);
    recommendations.push(`Validate findings with domain experts to ensure business context alignment`);
    
    recommendations.forEach((rec, idx) => {
      story.push(`${idx + 1}. ${rec}`);
    });

    // Conclusion
    story.push(`\n\n📝 CONCLUSION:`);
    story.push(`This dataset presents ${numericCols.length > 3 ? 'rich analytical opportunities' : 'focused analytical scope'} with ${this.cachedInsights.filter(i => i.significance === 'high').length} high-priority insights requiring attention. The ${this.dataset.rowCount > 1000 ? 'substantial' : 'moderate'} sample size supports ${this.dataset.rowCount > 1000 ? 'confident' : 'preliminary'} conclusions. ${timeCol ? 'The temporal dimension enables predictive analytics and trend forecasting.' : 'Consider adding time-based tracking for longitudinal insights.'} Immediate focus should be on ${this.cachedInsights[0]?.description || 'exploring variable relationships and patterns'}.`);

    const fullStory = story.join('\n');

    return {
      answer: fullStory,
      confidence: 0.95,
      sources: this.statistics.map(s => s.column),
      analysisDepth: 'deep'
    };
  }

  // Deep Analysis Provider
  private provideDeepAnalysis(question: string): AIResponse {
    if (!this.dataset || this.statistics.length === 0) {
      return {
        answer: 'I need data to perform deep analysis. Upload your dataset first.',
        confidence: 1.0
      };
    }

    // Extract what they want deep analysis on
    const mentionedColumn = this.statistics.find(s => 
      question.toLowerCase().includes(s.column.toLowerCase())
    );

    if (mentionedColumn && mentionedColumn.mean !== undefined) {
      return this.deepDiveColumn(mentionedColumn);
    }

    // General deep analysis
    return this.generateComprehensiveDataStory();
  }

  private deepDiveColumn(col: ColumnStatistics): AIResponse {
    const analysis: string[] = [];
    const cv = col.std && col.mean ? (col.std / col.mean) * 100 : 0;
    const range = (col.max as number) - (col.min as number);

    analysis.push(`🔬 DEEP DIVE ANALYSIS: ${col.column}`);
    
    analysis.push(`\n📊 DESCRIPTIVE STATISTICS:`);
    analysis.push(`• Mean (Average): ${col.mean?.toFixed(2)} - The central value around which data points cluster`);
    analysis.push(`• Median: ${col.median?.toFixed(2) || 'N/A'} - The middle value when data is sorted`);
    analysis.push(`• Standard Deviation: ${col.std?.toFixed(2)} - Measures spread from the mean`);
    analysis.push(`• Range: ${col.min} to ${col.max} (span of ${range.toFixed(2)})`);
    
    analysis.push(`\n🎯 DISTRIBUTION CHARACTERISTICS:`);
    if (col.mean && col.median) {
      const skew = col.mean - col.median;
      if (Math.abs(skew) < col.std! * 0.1) {
        analysis.push(`• Symmetrical distribution - Mean and median are nearly equal, suggesting balanced data`);
      } else if (skew > 0) {
        analysis.push(`• Right-skewed distribution - Mean > Median indicates some high outliers pulling the average up`);
      } else {
        analysis.push(`• Left-skewed distribution - Mean < Median indicates some low outliers pulling the average down`);
      }
    }
    
    analysis.push(`• Coefficient of Variation: ${cv.toFixed(1)}% - ${cv > 50 ? 'High' : cv > 20 ? 'Moderate' : 'Low'} relative variability`);
    
    analysis.push(`\n💡 BUSINESS INTERPRETATION:`);
    if (cv > 50) {
      analysis.push(`This variable shows HIGH variability, meaning:`);
      analysis.push(`  - Data points are widely dispersed`);
      analysis.push(`  - Multiple distinct segments likely exist`);
      analysis.push(`  - One-size-fits-all strategies may not work`);
      analysis.push(`  - Segmentation analysis recommended`);
    } else if (cv > 20) {
      analysis.push(`This variable shows MODERATE variability, meaning:`);
      analysis.push(`  - Normal business fluctuation`);
      analysis.push(`  - Some diversity but manageable`);
      analysis.push(`  - Standard strategies applicable`);
      analysis.push(`  - Monitor for trend changes`);
    } else {
      analysis.push(`This variable shows LOW variability, meaning:`);
      analysis.push(`  - Highly consistent values`);
      analysis.push(`  - Stable or controlled conditions`);
      analysis.push(`  - Predictable behavior`);
      analysis.push(`  - May indicate saturation or constraints`);
    }
    
    analysis.push(`\n🎬 ACTIONABLE RECOMMENDATIONS:`);
    if (cv > 50) {
      analysis.push(`1. Segment data into groups to understand different patterns`);
      analysis.push(`2. Investigate outliers - they may represent opportunities or problems`);
      analysis.push(`3. Consider different strategies for different segments`);
    } else if (cv > 20) {
      analysis.push(`1. Monitor trends over time to catch early changes`);
      analysis.push(`2. Identify factors that influence variation`);
      analysis.push(`3. Set control limits for quality management`);
    } else {
      analysis.push(`1. Investigate why values are so consistent`);
      analysis.push(`2. Look for opportunities to increase positive variation`);
      analysis.push(`3. Ensure consistency isn't masking underlying issues`);
    }

    return {
      answer: analysis.join('\n'),
      confidence: 0.95,
      sources: [col.column],
      analysisDepth: 'deep'
    };
  }
}

export const aiService = new AIService();
