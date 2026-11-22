import React, { useState, useRef } from 'react';
import { UploadCloud, FileUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadDocument } from '../api/client';

export default function UploadBox({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF documents are supported.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size must be under 25MB.');
      return;
    }

    setErrorMessage(null);
    setStatusMessage('Uploading and extracting text...');
    setIsUploading(true);
    setProgress(15);

    try {
      const data = await uploadDocument(file, (pct) => {
        // Upload is first 60%, rest is parsing & embedding
        setProgress(Math.min(75, Math.max(15, Math.round(pct * 0.75))));
      });

      setProgress(100);
      setStatusMessage(`Indexed ${data.page_count} pages (${data.chunk_count} chunks)`);
      setTimeout(() => {
        setIsUploading(false);
        setStatusMessage(null);
        setProgress(0);
        if (onUploadSuccess) onUploadSuccess(data);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setProgress(0);
      const detail = err.response?.data?.detail || err.message || 'Upload failed.';
      setErrorMessage(detail);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/40 bg-slate-800/20'
        } ${isUploading ? 'pointer-events-none opacity-90' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-3 py-2">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              <div className="w-full max-w-[200px] bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-300">{statusMessage}</span>
            </div>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">PDF notes or textbook (Max 25MB)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2 text-rose-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-tight">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
