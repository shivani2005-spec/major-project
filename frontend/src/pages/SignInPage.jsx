import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both your email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password.trim());
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || 'Failed to sign in. Please check credentials.';
      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const demoEmail = 'alex.student@notewise.ai';
    const demoPw = 'StudyFast2026!';
    setEmail(demoEmail);
    setPassword(demoPw);

    try {
      // Try login first
      await login(demoEmail, demoPw);
      navigate(from, { replace: true });
    } catch (loginErr) {
      // If demo account doesn't exist yet, auto-create it!
      try {
        await signup('Alex Rivera', demoEmail, demoPw);
        navigate(from, { replace: true });
      } catch (signupErr) {
        setError('Demo sign in failed. Please create a new account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl font-bold tracking-tight text-white">NoteWise</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/20">AI</span>
          </div>
        </Link>
        <p className="text-xs text-slate-400">Welcome back! Sign in to continue studying.</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Sign In</h2>
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isSubmitting}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-medium transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>1-Click Demo</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="h-4 w-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative flex items-center">
              <Lock className="h-4 w-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
            Sign up now
          </Link>
        </div>
      </div>

      <div className="mt-6 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-400 transition-colors">
          ← Back to NoteWise AI Homepage
        </Link>
      </div>
    </div>
  );
}
