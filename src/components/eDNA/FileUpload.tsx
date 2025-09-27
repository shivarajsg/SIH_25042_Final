import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle, Download } from "lucide-react";
import Papa from "papaparse";
import { eDNAData } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onDataUpload: (data: eDNAData[]) => void;
}

const REQUIRED_FIELDS = ['sequence_id', 'raw_sequence', 'read_count', 'sample_location', 'depth'];
const SAMPLE_DATA_URL = '/sample-edna-data.csv';

export const FileUpload = ({ onDataUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<eDNAData[] | null>(null);
  const { toast } = useToast();

  const validateData = (data: any[]): { isValid: boolean; errors: string[]; validData: eDNAData[] } => {
    const errors: string[] = [];
    const validData: eDNAData[] = [];

    if (data.length === 0) {
      errors.push("File is empty");
      return { isValid: false, errors, validData };
    }

    // Check required fields
    const headers = Object.keys(data[0]);
    const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate data types and values
    data.forEach((row, index) => {
      const sequence_id = row.sequence_id?.toString().trim();
      const raw_sequence = row.raw_sequence?.toString().trim();
      const read_count = parseInt(row.read_count);
      const sample_location = row.sample_location?.toString().trim();
      const depth = parseFloat(row.depth);

      if (!sequence_id) {
        errors.push(`Row ${index + 1}: Missing sequence_id`);
        return;
      }

      if (!raw_sequence || !/^[ATCGN]+$/i.test(raw_sequence)) {
        errors.push(`Row ${index + 1}: Invalid DNA sequence (should contain only A, T, C, G, N)`);
        return;
      }

      if (isNaN(read_count) || read_count < 1) {
        errors.push(`Row ${index + 1}: Invalid read_count (should be a positive integer)`);
        return;
      }

      if (!sample_location) {
        errors.push(`Row ${index + 1}: Missing sample_location`);
        return;
      }

      if (isNaN(depth) || depth < 0) {
        errors.push(`Row ${index + 1}: Invalid depth (should be a non-negative number)`);
        return;
      }

      validData.push({
        sequence_id,
        raw_sequence: raw_sequence.toUpperCase(),
        read_count,
        sample_location,
        depth
      });
    });

    return { 
      isValid: errors.length === 0, 
      errors: errors.slice(0, 10), // Limit to first 10 errors
      validData 
    };
  };

  const processFile = useCallback((file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    setValidationErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setUploadProgress(50);
        
        const { isValid, errors, validData } = validateData(results.data);
        
        setUploadProgress(100);
        setIsProcessing(false);

        if (!isValid) {
          setValidationErrors(errors);
          toast({
            title: "Validation Failed",
            description: `Found ${errors.length} error(s) in your data`,
            variant: "destructive",
          });
          return;
        }

        setPreviewData(validData.slice(0, 5)); // Show first 5 rows as preview
        toast({
          title: "File Uploaded Successfully",
          description: `Validated ${validData.length} sequences`,
        });
      },
      error: (error) => {
        setIsProcessing(false);
        setValidationErrors([`Failed to parse CSV file: ${error.message}`]);
        toast({
          title: "Upload Failed",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      processFile(csvFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  }, [processFile, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleConfirmUpload = () => {
    if (previewData) {
      // Re-parse the full dataset for upload
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (file) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const { validData } = validateData(results.data);
            onDataUpload(validData);
          }
        });
      }
    }
  };

  const downloadSampleData = () => {
    const sampleData = [
      {
        sequence_id: "SEQ001",
        raw_sequence: "ATCGATCGATCGATCG",
        read_count: 150,
        sample_location: "Marine_Site_A",
        depth: 10.5
      },
      {
        sequence_id: "SEQ002", 
        raw_sequence: "GCTAGCTAGCTAGCTA",
        read_count: 230,
        sample_location: "Marine_Site_A",
        depth: 10.5
      },
      {
        sequence_id: "SEQ003",
        raw_sequence: "TTAAGGCCTTAAGGCC",
        read_count: 89,
        sample_location: "Marine_Site_B",
        depth: 25.0
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-edna-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sample Data Download */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Get Started</h3>
          <p className="text-sm text-muted-foreground">
            Download a sample dataset to test the pipeline or upload your own CSV file
          </p>
        </div>
        <Button onClick={downloadSampleData} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Sample Data
        </Button>
      </div>

      {/* File Upload Area */}
      <Card 
        className={`
          border-2 border-dashed transition-all duration-300
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${isProcessing ? 'pointer-events-none opacity-75' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className={`
              rounded-full p-4 transition-colors duration-300
              ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              <Upload className="h-8 w-8" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload eDNA Dataset</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your CSV file here, or click to browse
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Required fields: {REQUIRED_FIELDS.join(', ')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {REQUIRED_FIELDS.map(field => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button asChild disabled={isProcessing}>
                <span className="gap-2">
                  <FileText className="h-4 w-4" />
                  Choose File
                </span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isProcessing && (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Validation errors found:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Preview */}
      {previewData && (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <h3 className="font-semibold">Data Preview</h3>
                <Badge variant="secondary">{previewData.length} rows shown</Badge>
              </div>
              <Button onClick={handleConfirmUpload} className="gap-2">
                Process Dataset
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {REQUIRED_FIELDS.map(field => (
                      <th key={field} className="text-left p-2 font-medium">
                        {field.replace('_', ' ').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-mono text-xs">{row.sequence_id}</td>
                      <td className="p-2 font-mono text-xs max-w-32 truncate">
                        {row.raw_sequence}
                      </td>
                      <td className="p-2">{row.read_count.toLocaleString()}</td>
                      <td className="p-2">{row.sample_location}</td>
                      <td className="p-2">{row.depth}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};