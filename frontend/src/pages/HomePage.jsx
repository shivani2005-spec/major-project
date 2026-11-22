import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Database,
  ArrowRight,
  Layers,
  Quote,
  Zap,
  Users,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-tl from-indigo-700/10 via-blue-600/10 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-white">NoteWise</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/20">AI</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-300 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#architecture" className="hover:text-white transition-colors">RAG Tech</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
              >
                <span>Workspace ({user?.name?.split(' ')[0]})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Full-Stack Document Intelligence with RAG & MongoDB</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Turn Long Textbooks & Lecture Notes into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Instant Grounded Answers.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Upload PDFs, ask questions in plain English, and get answers cited with 
          exact page numbers. Grounded exclusively in your study materials to eliminate hallucinations.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40"
          >
            <span>Start Studying with NoteWise</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 transition-all"
          >
            <Compass className="h-4 w-4 text-indigo-400" />
            <span>Launch Interactive Workspace</span>
          </Link>
        </div>

        {/* Social Proof / Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl border-t border-slate-800/80 pt-8 text-left">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
            <p className="text-2xl font-bold text-indigo-400 font-mono">100%</p>
            <p className="text-xs text-slate-400 mt-0.5">Grounded Answers</p>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
            <p className="text-2xl font-bold text-violet-400 font-mono">&lt; 3s</p>
            <p className="text-xs text-slate-400 mt-0.5">Retrieval Latency</p>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
            <p className="text-2xl font-bold text-emerald-400 font-mono">Page #</p>
            <p className="text-xs text-slate-400 mt-0.5">Verifiable Citations</p>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
            <p className="text-2xl font-bold text-amber-400 font-mono">0%</p>
            <p className="text-xs text-slate-400 mt-0.5">Hallucination Policy</p>
          </div>
        </div>

        {/* Interactive App Preview Showcase */}
        <div className="mt-16 w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl p-4 sm:p-6 backdrop-blur-xl text-left">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-500">notewise.ai/app • RAG Study Session</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/20">
              MongoDB Connected
            </span>
          </div>

          {/* Mock Chat & Retrieval Layout */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left mock sidebar */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Indexed Document</span>
              <div className="p-2.5 rounded-lg bg-indigo-600/15 border border-indigo-500/40 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">Distributed_Systems.pdf</p>
                  <p className="text-[10px] text-slate-400">14 pages • 42 chunks</p>
                </div>
              </div>
            </div>

            {/* Right mock chat */}
            <div className="md:col-span-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
              {/* User question */}
              <div className="flex items-start justify-end space-x-2">
                <div className="bg-indigo-600 text-white rounded-xl rounded-tr-sm px-3.5 py-2 text-xs">
                  What is the difference between synchronous and asynchronous consensus?
                </div>
              </div>

              {/* NoteWise AI answer */}
              <div className="flex items-start space-x-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl rounded-tl-sm p-3.5 text-xs text-slate-200 space-y-2 max-w-[90%]">
                  <p>
                    According to <span className="font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">[Page 4]</span>, synchronous consensus assumes known upper bounds on message delays, whereas asynchronous models make no timing assumptions, subject to the FLP impossibility theorem <span className="font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">[Page 7]</span>.
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-[10px] text-indigo-300">
                    <Quote className="h-3 w-3" />
                    <span>Citations: Page 4, Page 7 (98% cosine match)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Designed for High Performance</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Academic Rigor & Accuracy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Page-Level PyMuPDF Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts and indexes text page by page. Retains precise metadata across every chunk so citations remain 100% verifiable.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dense Vector Similarity Search</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Finds conceptual answers even when your question uses completely different wording than the textbook using cosine similarity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Anti-Hallucination Guardrails</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict grounded prompts instruct the LLM to only answer if context supports it, falling back to clean disclaimers otherwise.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">MongoDB User & Doc Persistence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scalable NoSQL schema with user libraries, encrypted passwords, chat logs, and automatic local fallback when offline.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Quote className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Source Proof Cards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click and expand any source citation to inspect the original text passage and relevance score without opening the PDF.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Private Secure Accounts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              JWT token authentication with private document isolation ensures your study notes belong exclusively to you.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Simple Workflow</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">From Textbook to Answers in 3 Steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-lg flex items-center justify-center border border-indigo-500/30 mb-4">
              1
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">Upload Your PDF</h4>
            <p className="text-xs text-slate-400">
              Drag and drop lecture slides, textbook chapters, or research papers up to 25MB.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-lg flex items-center justify-center border border-indigo-500/30 mb-4">
              2
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">Semantic Indexing</h4>
            <p className="text-xs text-slate-400">
              The engine extracts text page-by-page, generates vector embeddings, and stores them in your private index.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-lg flex items-center justify-center border border-indigo-500/30 mb-4">
              3
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">Ask & Verify</h4>
            <p className="text-xs text-slate-400">
              Receive concise answers backed by clickable page references that lead directly to the source facts.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 px-6 max-w-4xl mx-auto my-10 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/30 text-center p-8 sm:p-12 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Start Studying with NoteWise AI Today</h2>
        <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Create your account in under 30 seconds and upload your first PDF lecture notes.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/signup"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">NoteWise AI</span>
            <span>— Intelligent Document-Based Q&A System with RAG</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/signin" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-slate-300 transition-colors">Sign Up</Link>
            <Link to="/app" className="hover:text-slate-300 transition-colors">Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
