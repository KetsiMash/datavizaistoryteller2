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

  // Main AI query processor
  public async query(userQuestion: string): Promise<AIResponse> {
    const question = userQuestion.toLowerCase().trim();

    // Check if data is available
    if (!this.dataset || this.statistics.length === 0) {
      return {
        answer: "I don't have any data loaded yet. Please upload a dataset first, and I'll be happy to analyze it for you.",
        confidence: 1.0
      };
    }

    // Analyze the question and generate response
    const response = this.analyzeQuestion(question);
    return response;
  }

  private analyzeQuestion(question: string): AIResponse {
    // Question type detection
    if (this.isGreeting(question)) {
      return this.handleGreeting();
    }

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
}

export const aiService = new AIService();
