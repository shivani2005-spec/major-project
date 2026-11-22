import React from 'react';
import { BookOpen, Sparkles, Settings, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ activeDoc, health, onOpenSettings }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-white">NoteWise</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">AI</span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent RAG Study & Research Assistant</p>
        </div>
      </div>

      {/* Active Document Badge */}
      <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60 max-w-sm truncate">
        <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
        <span className="text-xs text-slate-400">Context:</span>
        <span className="text-xs font-medium text-slate-200 truncate">
          {activeDoc ? activeDoc.filename : "All Indexed Documents"}
        </span>
        {activeDoc && (
          <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/40">
            {activeDoc.page_count} {activeDoc.page_count === 1 ? 'pg' : 'pgs'}
          </span>
        )}
      </div>

      {/* Status & Settings */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/60">
          {health?.llm_configured ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-300 text-[11px]">Gemini Ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-300 text-[11px]">Free/Local Mode</span>
            </>
          )}
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60 transition-colors"
          title="Configure API Key & Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
