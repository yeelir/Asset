import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileDown, Loader2, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/integrations/Core';
import { Asset } from '@/entities/all';

const CSV_TEMPLATE = `name,asset_id,make,model,serial_number,status,purchase_date,purchase_price,supplier,description
"Dell Laptop","LP001","Dell","Latitude 7420","DL123456","available","2023-01-15","1200.00","Tech Supplier","15 inch laptop"
"Conference Room Camera","CM002","Sony","PXW-Z90","SN789123","checked_out","2023-02-10","800.50","AV Equipment Co","4K conference camera"
"Ethernet Cable 50ft","CBL003","Monoprice","Cat6","MP456789","available","2023-03-05","25.99","Cable Co","Cat6 ethernet cable"`;

export default function AssetImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'importing'
  const [previewData, setPreviewData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [importProgress, setImportProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setStep('upload');
    setPreviewData(null);
    setValidationResults(null);
    setImportResults(null);
    setImportProgress(0);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "asset_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVContent = (csvContent) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const expectedHeaders = ['name', 'asset_id', 'make', 'model', 'serial_number', 'status', 'purchase_date', 'purchase_price', 'supplier', 'description'];
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim()); // Add the last value
      
      if (values.length > 0 && values.some(v => v)) {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        rows.push({ ...rowData, _rowNumber: i + 1 });
      }
    }
    
    return rows;
  };

  const validateData = (data) => {
    const errors = [];
    const warnings = [];
    const validRows = [];
    
    data.forEach((row, index) => {
      const rowErrors = [];
      const rowWarnings = [];
      
      // Required field validation
      if (!row.name || row.name.trim() === '') {
        rowErrors.push('Name is required');
      }
      if (!row.asset_id || row.asset_id.trim() === '') {
        rowErrors.push('Asset ID is required');
      }
      
      // Status validation
      const validStatuses = ['available', 'checked_out', 'in_repair', 'maintenance', 'retired', 'installed'];
      if (row.status && !validStatuses.includes(row.status.toLowerCase())) {
        rowWarnings.push(`Status "${row.status}" will be set to "available"`);
        row.status = 'available';
      } else if (!row.status) {
        row.status = 'available';
      }
      
      // Price validation
      if (row.purchase_price && row.purchase_price !== '') {
        const price = parseFloat(row.purchase_price);
        if (isNaN(price) || price < 0) {
          rowWarnings.push('Invalid purchase price, will be set to 0');
          row.purchase_price = '';
        }
      }
      
      // Date validation
      if (row.purchase_date && row.purchase_date !== '') {
        const date = new Date(row.purchase_date);
        if (isNaN(date.getTime())) {
          rowWarnings.push('Invalid date format, will be cleared');
          row.purchase_date = '';
        }
      }
      
      if (rowErrors.length > 0) {
        errors.push({
          row: index + 1,
          data: row,
          errors: rowErrors,
          warnings: rowWarnings
        });
      } else {
        if (rowWarnings.length > 0) {
          warnings.push({
            row: index + 1,
            data: row,
            warnings: rowWarnings
          });
        }
        validRows.push(row);
      }
    });
    
    return { errors, warnings, validRows };
  };

  const handlePreview = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const fileContent = await file.text();
      const parsedData = parseCSVContent(fileContent);
      
      if (parsedData.length === 0) {
        throw new Error('No valid data found in CSV file. Please check the format.');
      }
      
      const validation = validateData(parsedData);
      setPreviewData(parsedData);
      setValidationResults(validation);
      setStep('preview');
    } catch (error) {
      setValidationResults({
        errors: [{ row: 0, errors: [error.message], data: {} }],
        warnings: [],
        validRows: []
      });
      setStep('preview');
    }
    setIsLoading(false);
  };

  const handleImport = async () => {
    if (!validationResults || validationResults.validRows.length === 0) return;
    
    setIsLoading(true);
    setStep('importing');
    setImportProgress(0);
    
    try {
      const assetsToCreate = validationResults.validRows.map(row => ({
        name: row.name,
        asset_id: row.asset_id,
        make: row.make || null,
        model: row.model || null,
        serial_number: row.serial_number || null,
        status: row.status || 'available',
        purchase_date: row.purchase_date || null,
        purchase_price: row.purchase_price ? parseFloat(row.purchase_price) : null,
        supplier: row.supplier || null,
        description: row.description || null
      }));
      
      // Import in smaller batches with longer delays to avoid rate limiting
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < assetsToCreate.length; i += batchSize) {
        batches.push(assetsToCreate.slice(i, i + batchSize));
      }
      
      let successCount = 0;
      let failedCount = 0;
      const failedAssets = [];
      
      for (let i = 0; i < batches.length; i++) {
        try {
          await Asset.bulkCreate(batches[i]);
          successCount += batches[i].length;
        } catch (error) {
          console.error(`Batch ${i + 1} failed:`, error);
          failedCount += batches[i].length;
          failedAssets.push(...batches[i]);
        }

        setImportProgress(((i + 1) / batches.length) * 100);
        // Add a longer delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setImportResults({
        success: successCount,
        failed: failedCount,
        failedAssets,
        total: assetsToCreate.length
      });
      
      if (successCount > 0) {
        onImportSuccess();
      }
    } catch (error) {
      setImportResults({
        success: 0,
        failed: validationResults.validRows.length,
        error: error.message,
        total: validationResults.validRows.length
      });
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setFile(null);
    setStep('upload');
    setPreviewData(null);
    setValidationResults(null);
    setImportResults(null);
    setImportProgress(0);
    onClose();
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-slate-600 mb-4">
          Upload a CSV file to import multiple assets at once.
        </p>
        <Button variant="outline" onClick={downloadTemplate} className="mb-4">
          <FileDown className="w-4 h-4 mr-2" />
          Download CSV Template
        </Button>
      </div>
      <Input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange}
        className="file:bg-slate-100 file:text-slate-700 file:border-0 file:rounded-md file:px-3 file:py-1"
      />
      {file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {validationResults?.errors?.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{validationResults.errors.length} rows have errors and will be skipped:</strong>
            <ul className="mt-2 space-y-1">
              {validationResults.errors.slice(0, 5).map((error, idx) => (
                <li key={idx} className="text-sm">
                  Row {error.row}: {error.errors.join(', ')}
                </li>
              ))}
              {validationResults.errors.length > 5 && (
                <li className="text-sm">... and {validationResults.errors.length - 5} more</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {validationResults?.warnings?.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{validationResults.warnings.length} rows have warnings (will be imported with corrections):</strong>
            <ul className="mt-2 space-y-1">
              {validationResults.warnings.slice(0, 3).map((warning, idx) => (
                <li key={idx} className="text-sm">
                  Row {warning.row}: {warning.warnings.join(', ')}
                </li>
              ))}
              {validationResults.warnings.length > 3 && (
                <li className="text-sm">... and {validationResults.warnings.length - 3} more</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {validationResults?.validRows?.length > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>{validationResults.validRows.length} assets ready to import</strong>
          </AlertDescription>
        </Alert>
      )}
      
      {previewData && previewData.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Preview (first 5 rows):</h4>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Asset ID</th>
                  <th className="p-2 text-left">Make</th>
                  <th className="p-2 text-left">Model</th>
                  <th className="p-2 text-left">Serial</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.asset_id}</td>
                    <td className="p-2">{row.make}</td>
                    <td className="p-2">{row.model}</td>
                    <td className="p-2">{row.serial_number}</td>
                    <td className="p-2">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderImportingStep = () => (
    <div className="space-y-4 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      <p>Importing assets...</p>
      <Progress value={importProgress} className="w-full" />
      <p className="text-sm text-slate-600">{Math.round(importProgress)}% complete</p>
      <p className="text-sm text-slate-600">This may take a moment for large files. Please keep this window open.</p>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-4">
      {importResults?.success > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Successfully imported {importResults.success} assets!
          </AlertDescription>
        </Alert>
      )}
      
      {importResults?.failed > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to import {importResults.failed} assets.
            {importResults.error && <div className="mt-1 text-sm">{importResults.error}</div>}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Import completed. You can now close this dialog.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl glass-morphism">
        <DialogHeader>
          <DialogTitle>Import Assets from CSV</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Select a CSV file to import your assets'}
            {step === 'preview' && 'Review the data before importing'}
            {step === 'importing' && 'Importing your assets...'}
            {importResults && 'Import completed'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
          {importResults && renderResults()}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {importResults ? 'Close' : 'Cancel'}
          </Button>
          
          {step === 'upload' && file && (
            <Button onClick={handlePreview} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Preview & Validate
            </Button>
          )}
          
          {step === 'preview' && validationResults?.validRows?.length > 0 && (
            <Button onClick={handleImport} disabled={isLoading}>
              Import {validationResults.validRows.length} Assets
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}