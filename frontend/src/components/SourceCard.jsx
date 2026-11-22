import React, { useState } from 'react';
import { Bookmark, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function SourceCard({ source, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Confidence percentage
  const confidencePct = Math.round(Math.min(100, Math.max(0, source.score * 100)));

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/50 hover:bg-slate-800/80 transition-all overflow-hidden text-xs">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2.5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          {/* Page Badge */}
          <span className="shrink-0 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Page {source.page}
          </span>

          {/* Document name */}
          <span className="font-medium text-slate-300 truncate" title={source.document_name}>
            {source.document_name || 'Document'}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Match Score */}
          <span className="text-[10px] text-slate-400 font-mono">
            {confidencePct}% match
          </span>

          <div className="text-slate-400 hover:text-slate-200">
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </div>
      </div>

      {/* Snippet preview / expanded */}
      <div className={`px-2.5 pb-2.5 pt-0.5 text-slate-300 text-xs leading-relaxed border-t border-slate-700/30 ${isExpanded ? 'block' : 'line-clamp-2'}`}>
        <p className="font-serif italic text-slate-300/90 pl-2 border-l-2 border-indigo-500/40 my-1">
          "{source.snippet}"
        </p>
      </div>
    </div>
  );
}
