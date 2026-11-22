import React from 'react';
import { FileText, Trash2, Layers, Check, Files } from 'lucide-react';

export default function DocumentList({
  documents,
  activeDoc,
  onSelectDoc,
  onDeleteDoc,
}) {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {/* Option to query all documents */}
      <button
        onClick={() => onSelectDoc(null)}
        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
          activeDoc === null
            ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
            : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Files className="h-4 w-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold truncate">All Documents</p>
            <p className="text-[10px] text-slate-400">Query across full library</p>
          </div>
        </div>
        {activeDoc === null && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
      </button>

      {/* Individual documents */}
      <div className="space-y-1.5 pt-1">
        {documents.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 rounded-lg border border-slate-800/80 bg-slate-800/20">
            No documents uploaded yet. Upload a PDF above to begin asking questions!
          </div>
        ) : (
          documents.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/60 shadow-sm shadow-indigo-500/10'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start space-x-2.5 min-w-0 pr-2">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-slate-700/40 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-white font-semibold' : 'text-slate-200'
                      }`}
                      title={doc.filename}
                    >
                      {doc.filename}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400">
                      <span>{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span>{doc.chunk_count} chunks</span>
                      <span>•</span>
                      <span>{formatBytes(doc.file_size)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${doc.filename}" and its vector indices?`)) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
