import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, RotateCcw, HelpCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({
  messages,
  activeDoc,
  isLoading,
  onSendMessage,
  onClearHistory,
}) {
  const [inputQuestion, setInputQuestion] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;
    onSendMessage(inputQuestion.trim());
    setInputQuestion('');
  };

  const handleSuggestionClick = (suggestion) => {
    if (isLoading) return;
    onSendMessage(suggestion);
  };

  const suggestions = [
    "What are the main key concepts covered in this document?",
    "Summarize the primary conclusions and takeaways.",
    "List the critical definitions, formulas, or steps mentioned.",
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 overflow-hidden relative">
      {/* Top chat bar */}
      <div className="h-12 border-b border-slate-800/80 px-6 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40">
        <div className="flex items-center space-x-2">
          <span>Target:</span>
          <span className="font-semibold text-slate-200">
            {activeDoc ? activeDoc.filename : 'All Uploaded Notes'}
          </span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1 hover:text-slate-200 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center px-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/5">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">
              Ask NoteWise AI Anything
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Ask questions naturally in plain English. NoteWise AI retrieves the exact relevant passages from your uploaded PDFs, generates grounded answers, and cites page numbers.
            </p>

            <div className="w-full space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                Suggested Questions
              </p>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-xs text-slate-300 transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{s}</span>
                  <Sparkles className="h-3 w-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => <MessageBubble key={index} message={msg} />)
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-300 flex items-center space-x-2.5">
              <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
              <span>Searching passages & generating grounded response with citations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-slate-800/90 border border-slate-700/80 rounded-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={
              activeDoc
                ? `Ask a question about ${activeDoc.filename}...`
                : "Ask a question about your uploaded documents..."
            }
            disabled={isLoading}
            className="w-full py-3.5 pl-4 pr-12 bg-transparent text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className="absolute right-2.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-600/20"
            title="Send Question"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-500 mt-2">
          NoteWise AI responds strictly based on your documents to eliminate hallucination.
        </p>
      </div>
    </div>
  );
}
