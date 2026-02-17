import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, FileJson, FileText, X, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { parseFile } from '@/lib/dataParser';

const fileTypes = [
  { ext: 'CSV', icon: FileSpreadsheet, desc: 'Comma-separated values' },
  { ext: 'XLSX/XLS', icon: FileSpreadsheet, desc: 'Microsoft Excel' },
  { ext: 'JSON', icon: FileJson, desc: 'JavaScript Object Notation' },
  { ext: 'TXT', icon: FileText, desc: 'Tab or custom delimited' },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const { setDataset } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['csv', 'xlsx', 'xls', 'json', 'txt'];
    
    if (!ext || !validExtensions.includes(ext)) {
      setError('Invalid file type. Please upload CSV, XLSX, XLS, JSON, or TXT files.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const dataset = await parseFile(file);
      setDataset(dataset);
      navigate('/analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20" />
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Upload Your <span className="gradient-text">Dataset</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Drag and drop your file or click to browse. We'll automatically detect columns and data types.
            </p>
          </div>
          
          {/* Upload Zone */}
          <motion.div
            className={`upload-zone relative ${isDragging ? 'drag-over border-primary bg-primary/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {!file ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <p className="text-xl font-semibold mb-2">
                  Drop your file here or <span className="text-primary">browse</span>
                </p>
                <p className="text-muted-foreground">
                  Supports CSV, XLSX, XLS, JSON, and TXT files up to 50MB
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="ml-4 p-2 rounded-full hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </div>
            )}
          </motion.div>
          
          {error && (
            <motion.div 
              className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          {/* Continue Button */}
          {file && !error && (
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button 
                size="lg" 
                className="btn-gradient text-lg px-8"
                onClick={processFile}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 w-5 h-5" />
                    Continue to Analysis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
          
          {/* Supported Formats */}
          <div className="mt-16">
            <h3 className="text-center text-sm font-medium text-muted-foreground mb-6">
              SUPPORTED FILE FORMATS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fileTypes.map((type, i) => (
                <motion.div
                  key={type.ext}
                  className="glass-card p-4 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <type.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-sm">{type.ext}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
