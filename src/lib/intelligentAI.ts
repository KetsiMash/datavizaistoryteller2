// Intelligent AI Service with real reasoning capabilities
// System Prompt: Professional AI Voice Data Assistant
import { DatasetInfo, ColumnStatistics } from '@/types/analytics';

export interface IntelligentAIResponse {
  answer: string;
  reasoning: string;
  confidence: number;
  suggestions?: string[];
}

/**
 * AI Voice Data Assistant - System Behavior:
 * 
 * 1. Analyze uploaded datasets
 *    - Automatically detect columns, data types, trends, correlations, anomalies
 *    - Identify patterns: increases, decreases, seasonality, outliers, relationships
 *    - Perform statistical summaries: mean, median, min, max, growth rate
 * 
 * 2. Tell the Data Story
 *    - Convert numerical insights into clear, human-friendly explanations
 *    - Structure: Overview → Key Trends → Important Changes → Possible Causes → Conclusion
 * 
 * 3. Support Voice Interaction
 *    - Accept natural voice input
 *    - Answer ONLY what user asked
 *    - If unclear, ask clarifying question
 *    - Never assume missing information
 * 
 * 4. Answer Questions Precisely
 *    - Respond directly to specific question
 *    - Do not add unrelated insights unless requested
 *    - Compute calculations before answering
 *    - State assumptions clearly for predictions
 * 
 * 5. Behavior Rules
 *    - Be objective and data-driven
 *    - Do not hallucinate values
 *    - Base conclusions strictly on available data
 *    - If unsure: "I need more information to answer that accurately"
 *    - Keep responses concise but insightful
 * 
 * 6. Tone: Professional but conversational, clear and confident
 */

export class IntelligentAI {
  private dataset: DatasetInfo | null = null;
  private statistics: ColumnStatistics[] = [];
  private narrative: string = '';
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  public updateContext(
    dataset: DatasetInfo | null,
    statistics: ColumnStatistics[],
    narrative: string
  ) {
    this.dataset = dataset;
    this.statistics = statistics;
    this.narrative = narrative;
  }

  // Main intelligent query processor
  public async query(userQuestion: string): Promise<IntelligentAIResponse> {
    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: userQuestion });

    // Build comprehensive context
    const context = this.buildDataContext();
    
    // Generate intelligent response using advanced reasoning
    const response = await this.generateIntelligentResponse(userQuestion, context);
    
    // Add response to history
    this.conversationHistory.push({ role: 'assistant', content: response.answer });
    
    // Keep history manageable
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    return response;
  }

  private buildDataContext(): string {
    if (!this.dataset || this.statistics.length === 0) {
      return 'No data currently loaded.';
    }

    const context: string[] = [];
    
    context.push(`Dataset: ${this.dataset.name}`);
    context.push(`Records: ${this.dataset.rowCount.toLocaleString()}`);
    context.push(`Columns: ${this.statistics.length}`);
    
    // Detailed column information
    context.push('\nColumn Details:');
    this.statistics.forEach(col => {
      if (col.mean !== undefined) {
        context.push(`- ${col.column} (numeric): min=${col.min}, max=${col.max}, mean=${col.mean.toFixed(2)}, std=${col.std?.toFixed(2)}`);
      } else {
        context.push(`- ${col.column} (categorical): ${col.uniqueValues || 'multiple'} unique values`);
      }
    });

    // Add narrative if available
    if (this.narrative) {
      context.push(`\nData Story: ${this.narrative.substring(0, 500)}...`);
    }

    return context.join('\n');
  }

  private async generateIntelligentResponse(
    question: string,
    dataContext: string
  ): Promise<IntelligentAIResponse> {
    // Advanced reasoning engine
    const reasoning = this.performReasoning(question, dataContext);
    const answer = this.synthesizeAnswer(question, reasoning);
    const suggestions = this.generateSuggestions(question, reasoning);

    return {
      answer,
      reasoning: reasoning.summary,
      confidence: reasoning.confidence,
      suggestions
    };
  }

  private performReasoning(question: string, dataContext: string): {
    summary: string;
    confidence: number;
    insights: string[];
    dataPoints: any[];
  } {
    const insights: string[] = [];
    const dataPoints: any[] = [];
    let confidence = 0.9;

    // Parse question intent
    const intent = this.parseIntent(question);
    
    // Analyze data based on intent
    if (intent.type === 'analysis' && this.dataset) {
      // Perform deep data analysis
      const numericCols = this.statistics.filter(s => s.mean !== undefined);
      
      if (numericCols.length > 0) {
        // Statistical insights
        numericCols.forEach(col => {
          const cv = col.std && col.mean ? (col.std / col.mean) : 0;
          if (cv > 0.5) {
            insights.push(`${col.column} shows high variability (CV: ${(cv * 100).toFixed(1)}%)`);
          }
          
          // Detect outliers
          if (col.std && col.mean) {
            const range = (col.max as number) - (col.min as number);
            const expectedRange = col.std * 6;
            if (range > expectedRange * 2) {
              insights.push(`${col.column} likely contains outliers`);
            }
          }
        });

        // Comparative analysis
        if (numericCols.length >= 2) {
          const sorted = [...numericCols].sort((a, b) => (b.mean || 0) - (a.mean || 0));
          insights.push(`${sorted[0].column} has the highest average (${sorted[0].mean?.toFixed(2)})`);
          
          // Correlation hints
          insights.push(`Consider analyzing correlation between ${sorted[0].column} and ${sorted[1].column}`);
        }
      }

      // Temporal analysis
      const timeCol = this.statistics.find(s => /date|time|year|month/i.test(s.column));
      if (timeCol) {
        insights.push(`Time dimension available: ${timeCol.column} (${timeCol.min} to ${timeCol.max})`);
        insights.push('Trend analysis and forecasting are possible');
      }

      // Geographic analysis
      const geoCol = this.statistics.find(s => /country|region|city|location|market/i.test(s.column));
      if (geoCol) {
        insights.push(`Geographic dimension: ${geoCol.column} enables regional comparisons`);
      }

      // Categorical analysis
      const categoricalCols = this.statistics.filter(s => s.mean === undefined);
      if (categoricalCols.length > 0) {
        insights.push(`${categoricalCols.length} categorical dimensions for segmentation`);
      }
    }

    // Business context reasoning
    const businessContext = this.inferBusinessContext();
    if (businessContext) {
      insights.push(businessContext);
    }

    return {
      summary: insights.join('. '),
      confidence,
      insights,
      dataPoints
    };
  }

  private parseIntent(question: string): {
    type: 'analysis' | 'comparison' | 'trend' | 'explanation' | 'recommendation' | 'general';
    entities: string[];
    action: string;
  } {
    const q = question.toLowerCase();
    
    // Extract column names mentioned
    const entities = this.statistics
      .filter(col => q.includes(col.column.toLowerCase()))
      .map(col => col.column);

    // Determine intent type
    if (/compare|versus|vs|difference|between/i.test(q)) {
      return { type: 'comparison', entities, action: 'compare' };
    }
    
    if (/trend|over time|change|growth|decline/i.test(q)) {
      return { type: 'trend', entities, action: 'analyze_trend' };
    }
    
    if (/why|explain|how|reason|cause/i.test(q)) {
      return { type: 'explanation', entities, action: 'explain' };
    }
    
    if (/recommend|suggest|should|advice|what to do/i.test(q)) {
      return { type: 'recommendation', entities, action: 'recommend' };
    }
    
    if (/analyze|insight|pattern|tell me about/i.test(q)) {
      return { type: 'analysis', entities, action: 'analyze' };
    }

    return { type: 'general', entities, action: 'respond' };
  }

  private synthesizeAnswer(question: string, reasoning: any): string {
    if (!this.dataset || this.statistics.length === 0) {
      return this.handleNoDataScenario(question);
    }

    const intent = this.parseIntent(question);
    
    // RULE: Answer ONLY what was asked - be direct and precise
    if (intent.type === 'comparison' && intent.entities.length >= 2) {
      return this.answerComparisonDirectly(intent);
    }
    
    if (intent.type === 'trend') {
      return this.answerTrendDirectly(intent);
    }
    
    if (this.isSpecificValueQuestion(question)) {
      return this.answerSpecificValueDirectly(question);
    }
    
    if (this.isCalculationQuestion(question)) {
      return this.answerCalculationDirectly(question);
    }

    // For general analysis requests, use structured storytelling format
    if (intent.type === 'analysis' || /tell.*story|full analysis|complete|overview/i.test(question)) {
      return this.tellDataStory();
    }

    // For recommendations
    if (intent.type === 'recommendation') {
      return this.generateRecommendationResponse(intent, reasoning);
    }

    // For explanations
    if (intent.type === 'explanation') {
      return this.generateExplanationResponse(intent, reasoning);
    }

    // Default: Direct answer based on available data
    return this.generateDirectAnswer(question, intent, reasoning);
  }

  // Tell Data Story - Structured Format
  private tellDataStory(): string {
    const story: string[] = [];
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    const categoricalCols = this.statistics.filter(s => s.mean === undefined);

    // 1. OVERVIEW
    story.push('📊 DATA OVERVIEW:');
    story.push(`Your dataset "${this.dataset?.name}" contains ${this.dataset?.rowCount.toLocaleString()} records across ${this.statistics.length} variables.`);
    
    const businessContext = this.inferBusinessContext();
    if (businessContext) {
      story.push(businessContext);
    }

    // 2. KEY TRENDS
    story.push('\n📈 KEY TRENDS:');
    const trends = this.identifyKeyTrends();
    if (trends.length > 0) {
      trends.forEach(trend => story.push(`• ${trend}`));
    } else {
      story.push('• No time-series data available for trend analysis');
    }

    // 3. IMPORTANT CHANGES
    story.push('\n⚡ IMPORTANT FINDINGS:');
    const findings = this.identifyImportantChanges();
    findings.forEach(finding => story.push(`• ${finding}`));

    // 4. POSSIBLE CAUSES (only if supported by data)
    const causes = this.identifyPossibleCauses();
    if (causes.length > 0) {
      story.push('\n🔍 POSSIBLE FACTORS:');
      causes.forEach(cause => story.push(`• ${cause}`));
    }

    // 5. CONCLUSION
    story.push('\n✅ CONCLUSION:');
    story.push(this.generateConclusion());

    return story.join('\n');
  }

  // Answer specific questions directly without extra analysis
  private answerComparisonDirectly(intent: any): string {
    const col1 = this.statistics.find(s => s.column === intent.entities[0]);
    const col2 = this.statistics.find(s => s.column === intent.entities[1]);

    if (!col1 || !col2) {
      return `I cannot find both columns in the dataset. Available columns are: ${this.statistics.map(s => s.column).join(', ')}.`;
    }

    if (col1.mean === undefined || col2.mean === undefined) {
      return `${col1.mean === undefined ? col1.column : col2.column} is not a numeric column, so I cannot perform numerical comparison.`;
    }

    const diff = Math.abs((col1.mean || 0) - (col2.mean || 0));
    const higher = (col1.mean || 0) > (col2.mean || 0) ? col1.column : col2.column;
    const percentage = ((diff / Math.min(col1.mean || 1, col2.mean || 1)) * 100).toFixed(1);

    return `${higher} is higher. Specifically: ${col1.column} averages ${col1.mean?.toFixed(2)} while ${col2.column} averages ${col2.mean?.toFixed(2)}. That's a difference of ${diff.toFixed(2)} (${percentage}% higher).`;
  }

  private answerTrendDirectly(intent: any): string {
    const timeCol = this.statistics.find(s => /date|time|year|month/i.test(s.column));
    
    if (!timeCol) {
      return 'The dataset does not contain time-based columns (date, time, year, month) needed for trend analysis.';
    }

    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    if (numericCols.length === 0) {
      return `I found a time column (${timeCol.column}) but no numeric metrics to track trends.`;
    }

    return `Time data spans from ${timeCol.min} to ${timeCol.max}. ${numericCols[0].column} can be tracked over this period. Check the line chart visualization to see the trend direction. ${numericCols[0].max && numericCols[0].min ? `Values range from ${numericCols[0].min} to ${numericCols[0].max}.` : ''}`;
  }

  private isSpecificValueQuestion(q: string): boolean {
    return /(highest|lowest|maximum|minimum|largest|smallest|top|bottom|which.*most|which.*least)/i.test(q);
  }

  private answerSpecificValueDirectly(question: string): string {
    const isHighest = /(highest|maximum|largest|top|most)/i.test(question);
    const numericCols = this.statistics.filter(s => s.mean !== undefined);

    if (numericCols.length === 0) {
      return 'The dataset does not contain numeric columns to find highest/lowest values.';
    }

    // Find which column they're asking about
    const mentionedCol = numericCols.find(col => 
      question.toLowerCase().includes(col.column.toLowerCase())
    );

    if (mentionedCol) {
      const value = isHighest ? mentionedCol.max : mentionedCol.min;
      return `The ${isHighest ? 'highest' : 'lowest'} value in ${mentionedCol.column} is ${value}.`;
    }

    // If no specific column mentioned, show all
    const results = numericCols.map(col => ({
      column: col.column,
      value: isHighest ? col.max : col.min
    }));

    return `${isHighest ? 'Highest' : 'Lowest'} values: ${results.map(r => `${r.column}: ${r.value}`).join(', ')}.`;
  }

  private isCalculationQuestion(q: string): boolean {
    return /(average|mean|sum|total|count|how many)/i.test(q);
  }

  private answerCalculationDirectly(question: string): string {
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    
    // Find mentioned column
    const mentionedCol = numericCols.find(col => 
      question.toLowerCase().includes(col.column.toLowerCase())
    );

    if (mentionedCol) {
      if (/average|mean/i.test(question)) {
        return `The average ${mentionedCol.column} is ${mentionedCol.mean?.toFixed(2)}.`;
      }
      if (/total|sum/i.test(question)) {
        const total = (mentionedCol.mean || 0) * (this.dataset?.rowCount || 0);
        return `The total ${mentionedCol.column} is approximately ${total.toFixed(2)} (calculated as average × record count).`;
      }
    }

    if (/how many|count/i.test(question)) {
      return `The dataset contains ${this.dataset?.rowCount.toLocaleString()} records.`;
    }

    return `I can calculate averages, totals, and counts. Please specify which column you're interested in. Available numeric columns: ${numericCols.map(c => c.column).join(', ')}.`;
  }

  private generateDirectAnswer(question: string, intent: any, reasoning: any): string {
    // Extract what they're asking about
    const mentionedCols = intent.entities;
    
    if (mentionedCols.length > 0) {
      const col = this.statistics.find(s => s.column === mentionedCols[0]);
      if (col) {
        if (col.mean !== undefined) {
          return `${col.column}: Average is ${col.mean.toFixed(2)}, ranging from ${col.min} to ${col.max}. ${col.std ? `Standard deviation is ${col.std.toFixed(2)}.` : ''}`;
        } else {
          return `${col.column} is a categorical variable with ${col.uniqueValues || 'multiple'} distinct values.`;
        }
      }
    }

    // If no specific column, provide brief overview
    return `Your dataset has ${this.dataset?.rowCount.toLocaleString()} records with ${this.statistics.length} columns. ${reasoning.insights.length > 0 ? reasoning.insights[0] : 'Ask about specific columns for detailed analysis.'}`;
  }

  private generateAnalysisResponse(intent: any, reasoning: any): string {
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    
    if (intent.entities.length > 0) {
      // Specific column analysis
      const col = this.statistics.find(s => s.column === intent.entities[0]);
      if (col && col.mean !== undefined) {
        const cv = col.std && col.mean ? (col.std / col.mean) * 100 : 0;
        return `Analyzing ${col.column}: The average is ${col.mean.toFixed(2)}, ranging from ${col.min} to ${col.max}. ` +
          `With ${cv.toFixed(1)}% variability, this indicates ${cv > 50 ? 'high diversity - multiple segments likely exist' : cv > 20 ? 'moderate variation - typical business fluctuation' : 'strong consistency - stable conditions'}. ` +
          `${cv > 50 ? 'I recommend segmenting the data to understand different patterns.' : 'This metric is predictable and suitable for forecasting.'}`;
      }
    }

    // General analysis
    if (numericCols.length > 0) {
      const primary = numericCols[0];
      return `Your primary metric ${primary.column} averages ${primary.mean?.toFixed(2)}, with values spanning ${primary.min} to ${primary.max}. ` +
        `${numericCols.length > 1 ? `Comparing with ${numericCols[1].column} (avg: ${numericCols[1].mean?.toFixed(2)}), we can identify relationships and patterns.` : ''} ` +
        `The data structure supports ${this.statistics.length} dimensional analysis.`;
    }

    return `Your dataset contains ${this.statistics.length} variables across ${this.dataset?.rowCount} records, providing a comprehensive view for analysis.`;
  }

  private generateComparisonResponse(intent: any, reasoning: any): string {
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    
    if (numericCols.length >= 2) {
      const col1 = numericCols[0];
      const col2 = numericCols[1];
      const ratio = (col1.mean || 1) / (col2.mean || 1);
      
      return `Comparing ${col1.column} and ${col2.column}: ${col1.column} averages ${col1.mean?.toFixed(2)} while ${col2.column} averages ${col2.mean?.toFixed(2)}. ` +
        `That's a ${ratio.toFixed(2)}x difference. ${col1.column} ranges from ${col1.min} to ${col1.max}, and ${col2.column} from ${col2.min} to ${col2.max}. ` +
        `${ratio > 3 ? 'These operate on very different scales.' : 'These are comparable in magnitude.'} ` +
        `Check the scatter plot to see if they correlate.`;
    }

    return `To compare variables, I need at least two numeric columns. Your data has ${numericCols.length} numeric column(s).`;
  }

  private generateTrendResponse(intent: any, reasoning: any): string {
    const timeCol = this.statistics.find(s => /date|time|year|month/i.test(s.column));
    const numericCols = this.statistics.filter(s => s.mean !== undefined);

    if (timeCol && numericCols.length > 0) {
      return `Your data spans from ${timeCol.min} to ${timeCol.max}, enabling trend analysis for ${numericCols.length} metric(s). ` +
        `${numericCols[0].column} can be tracked over time to identify growth patterns, seasonality, or cyclical behavior. ` +
        `I recommend creating time-series visualizations and using the Predictions panel for forecasting.`;
    }

    return `Trend analysis requires time-based data. ${timeCol ? 'I found a time column but need numeric metrics to track.' : 'Add a date/time column to enable trend analysis.'}`;
  }

  private generateExplanationResponse(intent: any, reasoning: any): string {
    return `Let me explain: ${reasoning.summary}. ` +
      `This matters because understanding your data's characteristics helps you make better decisions. ` +
      `${reasoning.insights.length > 0 ? `Specifically, ${reasoning.insights[0]}.` : ''} ` +
      `Would you like me to dive deeper into any particular aspect?`;
  }

  private generateRecommendationResponse(intent: any, reasoning: any): string {
    const recommendations: string[] = [];
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    
    if (numericCols.some(c => c.std && c.mean && (c.std / c.mean) > 0.5)) {
      recommendations.push('Segment your high-variability data to find distinct patterns');
    }
    
    if (this.statistics.some(s => /date|time/i.test(s.column))) {
      recommendations.push('Perform time-series analysis to forecast future trends');
    }
    
    if (numericCols.length >= 2) {
      recommendations.push('Analyze correlations to identify causal relationships');
    }
    
    recommendations.push('Create visualizations to communicate insights effectively');
    recommendations.push('Set up monitoring dashboards for ongoing tracking');

    return `Based on your data characteristics, I recommend: ${recommendations.slice(0, 3).map((r, i) => `${i + 1}) ${r}`).join('; ')}. ` +
      `These actions will help you extract maximum value from your data.`;
  }

  private generateGeneralResponse(intent: any, reasoning: any): string {
    return `${reasoning.summary}. Your dataset provides ${this.statistics.length} dimensions for analysis across ${this.dataset?.rowCount} records. ` +
      `${reasoning.insights.length > 0 ? reasoning.insights[0] + '.' : ''} ` +
      `Feel free to ask specific questions about any aspect of your data.`;
  }

  private handleNoDataScenario(question: string): string {
    const q = question.toLowerCase();
    
    if (/how|what|why|explain/i.test(q)) {
      return `I can help with that! ${this.provideGeneralKnowledge(question)} Once you upload data, I can provide specific insights tailored to your dataset.`;
    }
    
    return `I don't have data loaded yet, but I'm ready to analyze once you upload it. I can help with data analysis, visualization, trends, correlations, and actionable insights. What would you like to know?`;
  }

  private provideGeneralKnowledge(question: string): string {
    const knowledge: { [key: string]: string } = {
      'correlation': 'Correlation measures the relationship between two variables. Positive correlation means they move together, negative means they move opposite. However, correlation doesn\'t prove causation.',
      'trend': 'A trend is the general direction data moves over time. Identifying trends helps predict future behavior and make informed decisions.',
      'outlier': 'Outliers are data points significantly different from others. They can indicate errors, special cases, or important insights worth investigating.',
      'average': 'The average (mean) is the sum of values divided by count. It represents the central tendency but can be skewed by outliers.',
      'analyze': 'Data analysis involves examining data to discover patterns, trends, and insights that inform decision-making. Start with understanding your data structure, then explore relationships and patterns.',
    };

    for (const [key, value] of Object.entries(knowledge)) {
      if (question.toLowerCase().includes(key)) {
        return value;
      }
    }

    return 'I can explain data concepts, provide analysis guidance, and help you understand your data better.';
  }

  private inferBusinessContext(): string | null {
    const colNames = this.statistics.map(s => s.column.toLowerCase()).join(' ');
    
    if (/price.*market|commodity.*price/i.test(colNames)) {
      return 'This appears to be market pricing data - valuable for understanding price dynamics and market trends';
    }
    
    if (/sales|revenue|customer/i.test(colNames)) {
      return 'This looks like business performance data - key for revenue analysis and customer insights';
    }
    
    return null;
  }

  private generateSuggestions(question: string, reasoning: any): string[] {
    const suggestions: string[] = [];
    
    if (this.statistics.length > 0) {
      suggestions.push(`Tell me about ${this.statistics[0].column}`);
    }
    
    if (this.statistics.length >= 2) {
      suggestions.push(`Compare ${this.statistics[0].column} and ${this.statistics[1].column}`);
    }
    
    suggestions.push('What are the key insights?');
    suggestions.push('Show me trends over time');
    suggestions.push('What should I focus on?');
    
    return suggestions.slice(0, 3);
  }

  // Structured storytelling helper methods
  private identifyKeyTrends(): string[] {
    const trends: string[] = [];
    const timeCol = this.statistics.find(s => /date|time|year|month/i.test(s.column));
    const numericCols = this.statistics.filter(s => s.mean !== undefined);

    if (timeCol && numericCols.length > 0) {
      trends.push(`Time period: ${timeCol.min} to ${timeCol.max}`);
      numericCols.slice(0, 2).forEach(col => {
        trends.push(`${col.column} ranges from ${col.min} to ${col.max} (avg: ${col.mean?.toFixed(2)})`);
      });
    }

    return trends;
  }

  private identifyImportantChanges(): string[] {
    const changes: string[] = [];
    const numericCols = this.statistics.filter(s => s.mean !== undefined);

    numericCols.forEach(col => {
      const cv = col.std && col.mean ? (col.std / col.mean) * 100 : 0;
      
      if (cv > 50) {
        changes.push(`${col.column} shows high variability (${cv.toFixed(1)}% CV) - indicates diverse patterns or segments`);
      }
      
      if (col.std && col.mean) {
        const range = (col.max as number) - (col.min as number);
        const expectedRange = col.std * 6;
        if (range > expectedRange * 2) {
          changes.push(`${col.column} contains potential outliers - range exceeds expected distribution`);
        }
      }
    });

    if (changes.length === 0) {
      changes.push('Data shows consistent patterns without major anomalies');
    }

    return changes.slice(0, 3);
  }

  private identifyPossibleCauses(): string[] {
    const causes: string[] = [];
    
    // Only suggest causes if we have supporting data dimensions
    const hasLocation = this.statistics.some(s => /country|region|city|location|market/i.test(s.column));
    const hasCategory = this.statistics.some(s => /category|type|class|commodity|product/i.test(s.column));
    const hasTime = this.statistics.some(s => /date|time|year|month/i.test(s.column));

    if (hasLocation) {
      causes.push('Geographic factors - different regions may show different patterns');
    }
    
    if (hasCategory) {
      causes.push('Category differences - variations across product/commodity types');
    }
    
    if (hasTime) {
      causes.push('Temporal factors - seasonal effects or time-based changes');
    }

    // Note: We only suggest factors present in data, never fabricate
    return causes;
  }

  private generateConclusion(): string {
    const numericCols = this.statistics.filter(s => s.mean !== undefined);
    const hasHighVariability = numericCols.some(c => c.std && c.mean && (c.std / c.mean) > 0.5);
    
    let conclusion = `This dataset with ${this.dataset?.rowCount.toLocaleString()} records provides `;
    
    if (this.dataset!.rowCount > 1000) {
      conclusion += 'robust statistical foundation for confident analysis. ';
    } else if (this.dataset!.rowCount > 100) {
      conclusion += 'adequate data for meaningful insights. ';
    } else {
      conclusion += 'preliminary insights - consider gathering more data for stronger conclusions. ';
    }

    if (hasHighVariability) {
      conclusion += 'High variability suggests segmentation analysis would reveal distinct patterns. ';
    }

    conclusion += 'Focus on the key findings above for actionable insights.';
    
    return conclusion;
  }
}

export const intelligentAI = new IntelligentAI();
