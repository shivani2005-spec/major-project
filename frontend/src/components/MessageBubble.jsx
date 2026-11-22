import React, { useState } from 'react';
import { User, Sparkles, Copy, Check, Quote } from 'lucide-react';
import SourceCard from './SourceCard';

export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render markdown formatting: bolding, lists, citations [Page X]
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Split text into lines to process lists
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Check if bullet point
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Highlight [Page X] citations
      const parts = cleanLine.split(/(\[Page \d+\]|\[Document [^\]]+\])/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (/^\[(Page \d+|Document [^\]]+)\]$/.test(part)) {
          return (
            <span
              key={pIdx}
              className="inline-block px-1.5 py-0.2 mx-1 text-[11px] font-mono font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
            >
              {part}
            </span>
          );
        }
        // Bold formatting **text**
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            return <strong key={bIdx} className="font-semibold text-white">{bPart.slice(2, -2)}</strong>;
          }
          return bPart;
        });
      });

      if (isBullet) {
        return (
          <li key={lIdx} className="ml-4 list-disc text-slate-200 my-0.5">
            {formattedLine}
          </li>
        );
      }

      if (cleanLine.trim() === '') {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="my-1 text-slate-200 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/20 mt-1">
          <Sparkles className="h-4 w-4" />
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 transition-all ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/10'
            : 'bg-slate-800/80 border border-slate-700/60 rounded-tl-sm text-slate-100 shadow-md'
        }`}
      >
        {/* Header / sender info */}
        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/5">
          <span className="text-[11px] font-medium text-slate-400">
            {isUser ? 'You' : 'NoteWise AI'}
          </span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              title="Copy answer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Message body */}
        <div className="text-xs md:text-sm">
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{message.message}</p>
          ) : (
            <div>{renderFormattedText(message.message)}</div>
          )}
        </div>

        {/* Source Citations */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-semibold mb-2">
              <Quote className="h-3.5 w-3.5 text-indigo-400" />
              <span>Cited Sources ({message.sources.length}):</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {message.sources.map((source, idx) => (
                <SourceCard key={idx} source={source} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
