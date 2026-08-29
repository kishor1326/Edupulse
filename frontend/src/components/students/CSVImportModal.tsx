import React, { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, AlertTriangle, FileText, Download, Sparkles } from 'lucide-react';
import { studentService, CSVImportResponse } from '../../services/students';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CSVImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid .csv file.');
        return;
      }
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const res = await studentService.importCSV(file);
      setResult(res);
      if (res.successful_imports > 0) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'CSV upload and validation failed.');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'student_id,name,email,department,year,semester,attendance,marks,assignment_completion,previous_performance,participation,backlogs,study_hours\n' +
      'STU8001,Aarav Mehta,aarav.m@college.edu,CSE,2,4,48.5,42.0,45.0,50.0,40.0,2,6.0\n' +
      'STU8002,Priya Sundaram,priya.s@college.edu,ECE,3,5,88.0,82.5,90.0,85.0,78.0,0,18.5\n' +
      'STU8003,Devansh Joshi,devansh.j@college.edu,AIDS,1,2,68.0,58.0,62.0,60.0,55.0,1,10.0\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_students_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Import Student Cohort (CSV)</h2>
              <p className="text-xs text-slate-400">Bulk ingestion & automated ML risk assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Sample template info */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Need the institutional column template?</span>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-emerald-400 font-bold transition-all text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
              file
                ? 'border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'border-white/15 hover:border-emerald-500/50 bg-white/[0.01]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-3">
              <UploadCloud className={`w-8 h-8 ${file ? 'text-emerald-400' : 'text-slate-400'}`} />
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-bold text-emerald-300">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                <p className="text-xs text-emerald-400/90 mt-2 font-semibold">Click to choose a different file</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-200">Click to browse or drag & drop student CSV</p>
                <p className="text-xs text-slate-400 mt-1">Required headers: student_id, name, department, attendance, marks</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Validation Report */}
          {result && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Import & AI Evaluation Complete</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Successfully ingested & scored:{' '}
                      <span className="text-emerald-400 font-bold font-mono">{result.successful_imports}</span> / {result.total_rows} rows
                    </p>
                  </div>
                </div>
              </div>

              {result.failed_rows > 0 && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Failed Rows ({result.failed_rows})</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs text-slate-300">
                    {result.errors.map((err, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                        <span className="font-mono text-amber-400 font-bold">Row {err.row_index}: </span>
                        <span>{err.errors.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-bold transition-all"
            >
              {result ? 'Close' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={!file || uploading}
              onClick={handleUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Validating & Predicting...' : 'Upload & Run AI'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
