import React, { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import mammoth from 'mammoth';
import { ResumeData, initialData } from '../types';

interface ResumeImporterProps {
  onImport: (data: ResumeData) => void;
}

export function ResumeImporter({ onImport }: ResumeImporterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        // Basic validation
        if (data.personalInfo) {
          onImport(data);
          setSuccess(true);
        } else {
          throw new Error('Invalid JSON format for resume.');
        }
      } else if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        // This is a very basic "import". Realistically, we'd need AI to parse this.
        // For now, we'll put the text into the summary or personal info as a placeholder
        // and suggest the user uses AI to refine it.
        const importedData: ResumeData = {
          ...initialData,
          summary: text.substring(0, 1000),
          personalInfo: {
            ...initialData.personalInfo,
            fullName: file.name.replace('.docx', ''),
          }
        };
        onImport(importedData);
        setSuccess(true);
      } else {
        throw new Error('Unsupported file format. Please use .json or .docx');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import file.');
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <input
          type="file"
          accept=".json,.docx"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={loading}
        />
        <div className={`
          border-2 border-dashed rounded-2xl p-8 text-center transition-all
          ${loading ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' : 
            'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-900 dark:group-hover:border-white'}
        `}>
          {loading ? (
            <div className="space-y-3">
              <Loader2 className="animate-spin text-zinc-400 mx-auto" size={32} />
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Parsing File...</p>
            </div>
          ) : success ? (
            <div className="space-y-3">
              <CheckCircle2 className="text-emerald-500 mx-auto" size={32} />
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Import Successful!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="text-zinc-400 mx-auto" size={32} />
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest">Import Resume</p>
                <p className="text-xs text-zinc-500">Drop .json or .docx files here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
