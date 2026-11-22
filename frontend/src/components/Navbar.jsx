import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Settings,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeDoc, health, onOpenSettings }) {
  const { user, logout } = useAuth();

  const isMongo = health?.database_engine === 'mongodb';

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-bold tracking-tight text-white">NoteWise</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/20">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Intelligent RAG Study Workspace</p>
          </div>
        </Link>
      </div>

      {/* Active Document Badge */}
      <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60 max-w-sm truncate">
        <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
        <span className="text-xs text-slate-400">Context:</span>
        <span className="text-xs font-medium text-slate-200 truncate">
          {activeDoc ? activeDoc.filename : "All Library Documents"}
        </span>
        {activeDoc && (
          <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/40 shrink-0">
            {activeDoc.page_count} {activeDoc.page_count === 1 ? 'page' : 'pages'}
          </span>
        )}
      </div>

      {/* Right Side: DB pill, Gemini pill, Settings, User profile & Sign Out */}
      <div className="flex items-center space-x-2.5">
        {/* Database Status */}
        <div
          className={`hidden lg:flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
            isMongo
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}
          title={isMongo ? "MongoDB Connected" : "Local SQLite Fallback Database"}
        >
          <Database className="h-3 w-3" />
          <span>{isMongo ? "MongoDB Active" : "Local DB"}</span>
        </div>

        {/* Gemini Status */}
        <div className="flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/60">
          {health?.llm_configured ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-300 hidden sm:inline">Gemini 2.5</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-300 hidden sm:inline">Local RAG</span>
            </>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60 transition-colors"
          title="Configure API Key & Model Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* User profile & Logout */}
        {user ? (
          <div className="flex items-center space-x-2 pl-1 border-l border-slate-800">
            <div
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md"
              title={user.email}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/15 hover:text-rose-400 text-slate-400 border border-slate-700/60 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/signin"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
