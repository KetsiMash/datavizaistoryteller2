import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DataSet, StatSummary, ChartConfig, AnalysisConfig } from '@/types/analytics';
import { generateChartExplanation } from './insightGenerator';

interface ActionableInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  whyItMatters?: string;
  action?: string;
  impact?: string;
  relatedColumns?: string[];
}

interface ReportData {
  dataset: DataSet;
  statistics: StatSummary[];
  charts: ChartConfig[];
  insights: ActionableInsight[];
  analysisConfig: AnalysisConfig;
  chartsContainerRef: HTMLElement | null;
}

export async function generateComprehensivePDFReport(data: ReportData): Promise<void> {
  const { dataset, statistics, charts, insights, analysisConfig, chartsContainerRef } = data;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;
  
  const colors = {
    primary: [99, 102, 241] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    warning: [234, 179, 8] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
    text: [30, 41, 59] as [number, number, number],
    muted: [100, 116, 139] as [number, number, number],
    background: [248, 250, 252] as [number, number, number],
  };
  
  const addNewPage = () => {
    pdf.addPage();
    yPosition = margin;
  };
  
  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - margin) {
      addNewPage();
      return true;
    }
    return false;
  };
  
  const addTitle = (text: string, size: number = 18, color: [number, number, number] = colors.primary) => {
    checkPageBreak(15);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    pdf.setFont('helvetica', 'bold');
    pdf.text(text, margin, yPosition);
    yPosition += size * 0.5 + 3;
  };
  
  const addSubtitle = (text: string, size: number = 14) => {
    checkPageBreak(12);
    pdf.setFontSize(size);
    pdf.setTextColor(...colors.text);
    pdf.setFont('helvetica', 'bold');
    pdf.text(text, margin, yPosition);
    yPosition += size * 0.4 + 2;
  };
  
  const addParagraph = (text: string, size: number = 10) => {
    pdf.setFontSize(size);
    pdf.setTextColor(...colors.muted);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(text, contentWidth);
    const lineHeight = size * 0.4;
    
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight + 2);
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight + 1;
    });
    yPosition += 3;
  };
  
  const addSeparator = () => {
    checkPageBreak(5);
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  };
  
  const addBox = (content: () => void, bgColor: [number, number, number] = colors.background) => {
    const startY = yPosition;
    yPosition += 5;
    content();
    const endY = yPosition;
    
    // Draw background box
    pdf.setFillColor(...bgColor);
    pdf.setDrawColor(...colors.primary);
    pdf.roundedRect(margin - 3, startY - 3, contentWidth + 6, endY - startY + 6, 3, 3, 'F');
  };
  
  // === COVER PAGE ===
  yPosition = 50;
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pageWidth, 80, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data Analysis Report', margin, 40);
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(dataset.name, margin, 55);
  
  yPosition = 100;
  
  // Report metadata
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, margin, yPosition);
  yPosition += 8;
  
  pdf.text(`Analysis Type: ${analysisConfig.type.charAt(0).toUpperCase() + analysisConfig.type.slice(1)}`, margin, yPosition);
  yPosition += 8;
  
  pdf.text(`Total Records: ${dataset.rowCount.toLocaleString()}`, margin, yPosition);
  yPosition += 8;
  
  pdf.text(`Columns Analyzed: ${analysisConfig.selectedColumns.length}`, margin, yPosition);
  yPosition += 20;
  
  // Table of contents
  addTitle('Table of Contents', 16);
  yPosition += 5;
  const tocItems = [
    '1. Executive Summary',
    '2. Dataset Overview',
    '3. Statistical Analysis',
    '4. Distribution Analysis',
    '5. Data Visualizations with AI Explanations',
    '6. Key Insights & Recommendations',
    '7. Conclusion',
  ];
  
  tocItems.forEach(item => {
    pdf.setFontSize(11);
    pdf.setTextColor(...colors.muted);
    pdf.text(item, margin + 5, yPosition);
    yPosition += 7;
  });
  
  // === EXECUTIVE SUMMARY ===
  addNewPage();
  addTitle('1. Executive Summary', 18);
  addSeparator();
  
  const numericStats = statistics.filter(s => s.mean !== undefined);
  const categoricalStats = statistics.filter(s => s.mean === undefined);
  const warningInsights = insights.filter(i => i.severity === 'warning');
  const successInsights = insights.filter(i => i.severity === 'success');
  
  addParagraph(`This comprehensive analysis examines the "${dataset.name}" dataset containing ${dataset.rowCount.toLocaleString()} records across ${dataset.columns.length} variables. The ${analysisConfig.type} analysis was performed on ${analysisConfig.selectedColumns.length} selected columns to uncover meaningful patterns, relationships, and actionable insights.`);
  
  yPosition += 5;
  addSubtitle('Key Findings at a Glance');
  addParagraph(`• ${numericStats.length} numeric variables analyzed for statistical patterns`);
  addParagraph(`• ${categoricalStats.length} categorical variables identified for segmentation`);
  addParagraph(`• ${warningInsights.length} areas requiring attention identified`);
  addParagraph(`• ${successInsights.length} positive indicators discovered`);
  addParagraph(`• ${charts.length} visualizations generated for comprehensive understanding`);
  
  // === DATASET OVERVIEW ===
  yPosition += 10;
  addTitle('2. Dataset Overview', 18);
  addSeparator();
  
  addSubtitle('Analyzed Columns');
  analysisConfig.selectedColumns.forEach((col, idx) => {
    const colData = dataset.columns.find(c => c.name === col);
    addParagraph(`${idx + 1}. ${col} (${colData?.type || 'unknown'}) - ${colData?.uniqueCount || 0} unique values`);
  });
  
  // === STATISTICAL ANALYSIS ===
  addNewPage();
  addTitle('3. Statistical Analysis', 18);
  addSeparator();
  
  if (numericStats.length > 0) {
    addSubtitle('Numeric Variables Summary');
    yPosition += 3;
    
    numericStats.forEach(stat => {
      checkPageBreak(40);
      
      // Variable header
      pdf.setFillColor(245, 247, 250);
      pdf.roundedRect(margin, yPosition - 3, contentWidth, 35, 2, 2, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(...colors.primary);
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.column, margin + 5, yPosition + 5);
      
      // Stats in two columns
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text);
      pdf.setFont('helvetica', 'normal');
      
      const leftCol = margin + 5;
      const rightCol = margin + contentWidth / 2;
      let statY = yPosition + 12;
      
      pdf.text(`Mean: ${stat.mean?.toLocaleString() ?? 'N/A'}`, leftCol, statY);
      pdf.text(`Median: ${stat.median?.toLocaleString() ?? 'N/A'}`, rightCol, statY);
      statY += 6;
      
      pdf.text(`Min: ${stat.min?.toLocaleString() ?? 'N/A'}`, leftCol, statY);
      pdf.text(`Max: ${stat.max?.toLocaleString() ?? 'N/A'}`, rightCol, statY);
      statY += 6;
      
      pdf.text(`Std Dev: ${stat.std?.toFixed(2) ?? 'N/A'}`, leftCol, statY);
      pdf.text(`Variance: ${stat.variance?.toFixed(2) ?? 'N/A'}`, rightCol, statY);
      
      yPosition += 42;
    });
  }
  
  // === DISTRIBUTION ANALYSIS ===
  checkPageBreak(80);
  yPosition += 10;
  addTitle('4. Distribution Analysis (Skewness & Kurtosis)', 18);
  addSeparator();
  
  numericStats.forEach(stat => {
    if (stat.skewness !== undefined) {
      checkPageBreak(35);
      
      const skewColor = stat.skewnessType === 'symmetric' 
        ? colors.success 
        : stat.skewnessType === 'right-skewed' 
        ? colors.warning 
        : colors.danger;
      
      pdf.setFillColor(...skewColor);
      pdf.roundedRect(margin, yPosition, 3, 25, 1, 1, 'F');
      
      pdf.setFontSize(11);
      pdf.setTextColor(...colors.text);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${stat.column}`, margin + 8, yPosition + 5);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.muted);
      pdf.text(`Skewness: ${stat.skewness.toFixed(3)} (${stat.skewnessType?.replace('-', ' ') ?? 'N/A'})`, margin + 8, yPosition + 12);
      pdf.text(`Kurtosis: ${stat.kurtosis?.toFixed(3) ?? 'N/A'}`, margin + 8, yPosition + 18);
      
      // Interpretation
      const interpretation = stat.skewnessType === 'symmetric' 
        ? 'Normal-like distribution, suitable for parametric statistical tests.'
        : stat.skewnessType === 'right-skewed'
        ? 'Tail extends right (more extreme high values). Consider log transformation.'
        : 'Tail extends left (more extreme low values). Review for floor effects.';
      
      const interpLines = pdf.splitTextToSize(interpretation, contentWidth - 15);
      pdf.text(interpLines, margin + 8, yPosition + 24);
      
      yPosition += 35;
    }
  });
  
  // === VISUALIZATIONS ===
  addNewPage();
  addTitle('5. Data Visualizations with AI Explanations', 18);
  addSeparator();
  
  addParagraph('Each visualization below includes an AI-generated explanation that interprets the patterns, trends, and key takeaways visible in the chart.');
  yPosition += 5;
  
  // Capture charts if container exists
  if (chartsContainerRef) {
    try {
      const chartElements = chartsContainerRef.querySelectorAll('[data-chart-container]');
      
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        checkPageBreak(120);
        
        // Chart title
        addSubtitle(`Chart ${i + 1}: ${chart.title}`);
        
        // Try to capture the actual chart
        const chartEl = chartElements[i] as HTMLElement;
        if (chartEl) {
          try {
            const canvas = await html2canvas(chartEl, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#1e293b',
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height / canvas.width) * imgWidth;
            
            checkPageBreak(imgHeight + 30);
            pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, Math.min(imgHeight, 80));
            yPosition += Math.min(imgHeight, 80) + 5;
          } catch (e) {
            // Fallback if chart capture fails
            pdf.setFillColor(240, 240, 245);
            pdf.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, 'F');
            pdf.setTextColor(...colors.muted);
            pdf.setFontSize(10);
            pdf.text(`[${chart.type.toUpperCase()} Chart: ${chart.title}]`, margin + 10, yPosition + 25);
            yPosition += 55;
          }
        } else {
          // No element found, show placeholder
          pdf.setFillColor(240, 240, 245);
          pdf.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, 'F');
          pdf.setTextColor(...colors.muted);
          pdf.setFontSize(10);
          pdf.text(`[${chart.type.toUpperCase()} Chart: ${chart.title}]`, margin + 10, yPosition + 25);
          yPosition += 55;
        }
        
        // AI Explanation
        yPosition += 3;
        pdf.setFillColor(245, 247, 255);
        const explanation = generateChartExplanation(chart, statistics);
        const explanationLines = pdf.splitTextToSize(explanation.replace(/\**/g, ''), contentWidth - 10);
        const explanationHeight = explanationLines.length * 5 + 10;
        
        checkPageBreak(explanationHeight);
        pdf.roundedRect(margin, yPosition, contentWidth, explanationHeight, 2, 2, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(...colors.primary);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Analysis:', margin + 5, yPosition + 6);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...colors.text);
        pdf.text(explanationLines, margin + 5, yPosition + 13);
        
        yPosition += explanationHeight + 10;
      }
    } catch (e) {
      addParagraph('Charts could not be captured. Please refer to the interactive dashboard for visualizations.');
    }
  } else {
    // No charts container, write descriptions only
    charts.forEach((chart, i) => {
      checkPageBreak(60);
      addSubtitle(`Chart ${i + 1}: ${chart.title}`);
      
      pdf.setFillColor(240, 240, 245);
      pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
      pdf.setTextColor(...colors.muted);
      pdf.setFontSize(10);
      pdf.text(`[${chart.type.toUpperCase()} Chart]`, margin + 10, yPosition + 15);
      yPosition += 35;
      
      const explanation = generateChartExplanation(chart, statistics);
      addParagraph(`AI Analysis: ${explanation.replace(/\**/g, '')}`);
      yPosition += 5;
    });
  }
  
  // === KEY INSIGHTS ===
  addNewPage();
  addTitle('6. Key Insights & Recommendations', 18);
  addSeparator();
  
  addParagraph('These actionable insights are derived from comprehensive analysis of your data. Each insight includes context, recommended actions, and potential business impact.');
  yPosition += 5;
  
  // Warning insights
  if (warningInsights.length > 0) {
    addSubtitle('⚠️ Areas Requiring Attention');
    warningInsights.forEach(insight => {
      checkPageBreak(45);
      
      pdf.setFillColor(254, 243, 199);
      pdf.roundedRect(margin, yPosition, contentWidth, 40, 2, 2, 'F');
      pdf.setDrawColor(...colors.warning);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPosition, contentWidth, 40, 2, 2, 'S');
      
      pdf.setFontSize(11);
      pdf.setTextColor(...colors.text);
      pdf.setFont('helvetica', 'bold');
      pdf.text(insight.title, margin + 5, yPosition + 7);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.muted);
      const descLines = pdf.splitTextToSize(insight.description, contentWidth - 10);
      pdf.text(descLines, margin + 5, yPosition + 14);
      
      if (insight.whyItMatters) {
        pdf.setTextColor(...colors.text);
        const whyLines = pdf.splitTextToSize(`Why It Matters: ${insight.whyItMatters}`, contentWidth - 10);
        pdf.text(whyLines, margin + 5, yPosition + 22);
      }
      
      if (insight.action) {
        pdf.setTextColor(...colors.primary);
        const actionLines = pdf.splitTextToSize(`Action: ${insight.action}`, contentWidth - 10);
        pdf.text(actionLines, margin + 5, yPosition + 30);
      }
      
      yPosition += 45;
    });
  }
  
  // Success insights
  if (successInsights.length > 0) {
    yPosition += 5;
    addSubtitle('✅ Positive Indicators');
    successInsights.forEach(insight => {
      checkPageBreak(40);
      
      pdf.setFillColor(220, 252, 231);
      pdf.roundedRect(margin, yPosition, contentWidth, 35, 2, 2, 'F');
      pdf.setDrawColor(...colors.success);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPosition, contentWidth, 35, 2, 2, 'S');
      
      pdf.setFontSize(11);
      pdf.setTextColor(...colors.text);
      pdf.setFont('helvetica', 'bold');
      pdf.text(insight.title, margin + 5, yPosition + 7);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.muted);
      const descLines = pdf.splitTextToSize(insight.description, contentWidth - 10);
      pdf.text(descLines, margin + 5, yPosition + 14);
      
      if (insight.impact) {
        pdf.setTextColor(...colors.success);
        pdf.text(`Impact: ${insight.impact}`, margin + 5, yPosition + 28);
      }
      
      yPosition += 40;
    });
  }
  
  // Other insights
  const otherInsights = insights.filter(i => i.severity !== 'warning' && i.severity !== 'success');
  if (otherInsights.length > 0) {
    yPosition += 5;
    addSubtitle('💡 Additional Insights');
    otherInsights.forEach(insight => {
      checkPageBreak(35);
      
      pdf.setFillColor(245, 247, 250);
      pdf.roundedRect(margin, yPosition, contentWidth, 30, 2, 2, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.text);
      pdf.setFont('helvetica', 'bold');
      pdf.text(insight.title, margin + 5, yPosition + 7);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.muted);
      const descLines = pdf.splitTextToSize(insight.description, contentWidth - 10);
      pdf.text(descLines, margin + 5, yPosition + 14);
      
      if (insight.action) {
        pdf.setTextColor(...colors.primary);
        pdf.text(`→ ${insight.action.slice(0, 100)}...`, margin + 5, yPosition + 24);
      }
      
      yPosition += 35;
    });
  }
  
  // === CONCLUSION ===
  addNewPage();
  addTitle('7. Conclusion', 18);
  addSeparator();
  
  addParagraph(`This comprehensive analysis of the "${dataset.name}" dataset has revealed important patterns and actionable insights across ${analysisConfig.selectedColumns.length} variables and ${dataset.rowCount.toLocaleString()} records.`);
  
  yPosition += 5;
  addSubtitle('Summary of Findings');
  
  if (numericStats.length > 0) {
    const avgSkewness = numericStats.reduce((sum, s) => sum + Math.abs(s.skewness || 0), 0) / numericStats.length;
    addParagraph(`• Numeric Analysis: ${numericStats.length} variables analyzed with an average absolute skewness of ${avgSkewness.toFixed(3)}`);
  }
  
  if (charts.filter(c => c.type === 'correlation').length > 0) {
    const corrCharts = charts.filter(c => c.type === 'correlation');
    const strongCorrs = corrCharts.filter(c => c.correlation?.strength === 'strong').length;
    addParagraph(`• Correlation Analysis: ${strongCorrs} strong correlations identified among ${corrCharts.length} variable pairs`);
  }
  
  addParagraph(`• Insights Generated: ${insights.length} actionable insights with specific recommendations`);
  addParagraph(`• Visualizations: ${charts.length} charts created to illustrate data patterns`);
  
  yPosition += 10;
  addSubtitle('Recommended Next Steps');
  addParagraph('1. Address any data quality issues identified in the warning insights');
  addParagraph('2. Leverage strong correlations for predictive modeling opportunities');
  addParagraph('3. Use categorical segmentation for targeted analysis and strategies');
  addParagraph('4. Consider time-series analysis if temporal patterns are relevant');
  addParagraph('5. Share these findings with stakeholders for informed decision-making');
  
  // Footer on last page
  yPosition = pageHeight - 20;
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.muted);
  pdf.text(`Report generated by DataViz AI on ${new Date().toLocaleString()}`, margin, yPosition);
  pdf.text(`© ${new Date().getFullYear()} DataViz AI - Data Analysis Platform`, margin, yPosition + 5);
  
  // Add page numbers to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.muted);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }
  
  // Save the PDF
  pdf.save(`${dataset.name.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_Report.pdf`);
}
