import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataSet, DataColumn } from '@/types/analytics';

function detectColumnType(values: any[]): 'number' | 'string' | 'date' | 'boolean' {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'string';
  
  // Check for boolean
  const boolValues = nonNullValues.filter(v => 
    typeof v === 'boolean' || 
    ['true', 'false', '0', '1', 'yes', 'no'].includes(String(v).toLowerCase())
  );
  if (boolValues.length === nonNullValues.length) return 'boolean';
  
  // Check for number
  const numValues = nonNullValues.filter(v => !isNaN(Number(v)) && v !== '');
  if (numValues.length === nonNullValues.length) return 'number';
  
  // Check for date
  const dateValues = nonNullValues.filter(v => {
    const d = new Date(v);
    return d instanceof Date && !isNaN(d.getTime());
  });
  if (dateValues.length > nonNullValues.length * 0.8) return 'date';
  
  return 'string';
}

function analyzeColumns(rows: Record<string, any>[]): DataColumn[] {
  if (rows.length === 0) return [];
  
  const columnNames = Object.keys(rows[0]);
  
  return columnNames.map(name => {
    const values = rows.map(row => row[name]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = new Set(values.map(v => JSON.stringify(v)));
    
    return {
      name,
      type: detectColumnType(values),
      sample: values.slice(0, 5),
      nullCount: values.length - nonNullValues.length,
      uniqueCount: uniqueValues.size,
    };
  });
}

export async function parseFile(file: File): Promise<DataSet> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let rows: Record<string, any>[] = [];
  
  if (extension === 'csv' || extension === 'txt') {
    rows = await parseCSV(file);
  } else if (extension === 'json') {
    rows = await parseJSON(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    rows = await parseExcel(file);
  } else {
    throw new Error(`Unsupported file format: ${extension}`);
  }
  
  const columns = analyzeColumns(rows);
  
  return {
    name: file.name,
    rows,
    columns,
    rowCount: rows.length,
    uploadedAt: new Date(),
  };
}

async function parseCSV(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, any>[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

async function parseJSON(file: File): Promise<Record<string, any>[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  
  if (Array.isArray(data)) {
    return data;
  } else if (typeof data === 'object') {
    // Check if it's a nested structure with a data array
    const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
    if (arrayKey) {
      return data[arrayKey];
    }
    // Single object, wrap in array
    return [data];
  }
  
  throw new Error('Invalid JSON structure');
}

async function parseExcel(file: File): Promise<Record<string, any>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet);
}
