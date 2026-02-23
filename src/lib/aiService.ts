// AI Service for intelligent data analysis and conversation
import { DatasetInfo, ColumnStatistics } from '@/types/analytics';

export interface AIResponse {
  answer: string;
  confidence: number;
  sources?: string[];
}

export class AIService {
  private dataset: DatasetInfo | null = null;
  private statistics: ColumnStatistics[] = [];
  private narrative: string = '';
  private charts: any[] = [];

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
    const numericCols = this.statistics.filter(s => s.mean !== undefined).length;
    const categoricalCols = this.statistics.length - numericCols;

    const answer = `Your dataset "${this.dataset?.name}" contains ${this.dataset?.rowCount} records with ${this.statistics.length} columns. ` +
      `It has ${numericCols} numeric columns and ${categoricalCols} categorical columns. ` +
      `The columns are: ${this.statistics.map(s => s.column).join(', ')}.`;

    return { answer, confidence: 1.0, sources: ['dataset metadata'] };
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
    // Intelligent fallback based on available data
    const suggestions = [];
    
    if (this.narrative) {
      suggestions.push("read the full data story");
    }
    if (this.charts.length > 0) {
      suggestions.push("explore the visualizations");
    }
    if (this.statistics.length > 0) {
      suggestions.push(`ask about specific columns like ${this.statistics[0].column}`);
    }

    const answer = `I'm not sure about "${question}", but I can help you ${suggestions.join(', or ')}. ` +
      `Try asking about statistics, trends, comparisons, or insights from your data.`;

    return {
      answer,
      confidence: 0.5
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
}

export const aiService = new AIService();
