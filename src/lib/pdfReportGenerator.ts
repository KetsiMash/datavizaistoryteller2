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
  predictionData?: any;
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
  
  const addTitle = (text: string, size: number = 18) => {
    checkPageBreak(15);
    pdf.setFontSize(size);
    pdf.setTextColor(...colors.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.text(text, margin, yPosition);
    yPosition += size * 0.5 + 3;
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
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 8;
  
  pdf.text(`Total Records: ${dataset.rowCount.toLocaleString()}`, margin, yPosition);
  yPosition += 8;
  
  pdf.text(`Columns Analyzed: ${analysisConfig.selectedColumns.length}`, margin, yPosition);
  yPosition += 20;
  
  // === EXECUTIVE SUMMARY ===
  addNewPage();
  addTitle('Executive Summary', 18);
  
  const numericStats = statistics.filter(s => s.mean !== undefined);
  const warningInsights = insights.filter(i => i.severity === 'warning');
  const successInsights = insights.filter(i => i.severity === 'success');
  
  addParagraph(`This analysis examines the "${dataset.name}" dataset containing ${dataset.rowCount.toLocaleString()} records. Key findings include ${numericStats.length} numeric variables analyzed, ${warningInsights.length} areas requiring attention, and ${successInsights.length} positive indicators.`);
  
  // === INSIGHTS ===
  addNewPage();
  addTitle('Key Insights', 18);
  
  insights.slice(0, 10).forEach((insight, i) => {
    checkPageBreak(40);
    
    pdf.setFontSize(12);
    pdf.setTextColor(...colors.text);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${i + 1}. ${insight.title}`, margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.muted);
    const lines = pdf.splitTextToSize(insight.description, contentWidth);
    lines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  });
  
  // Footer
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