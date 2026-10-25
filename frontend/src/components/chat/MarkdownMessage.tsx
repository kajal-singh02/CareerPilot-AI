import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-zinc-200">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // It's a code block
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const isLanguageTag = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const language = isLanguageTag ? firstLine : 'code';
          const code = isLanguageTag ? lines.slice(1).join('\n') : lines.join('\n');

          return <CodeBlock key={index} code={code} language={language} />;
        }

        // Standard text/markdown chunk
        return <FormattedTextChunk key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black/80 shadow-lg">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-950 border-b border-white/10 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#ef233c]" />
          <span className="uppercase text-white font-semibold">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition text-[11px] border border-white/10"
          title="Copy Code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FormattedTextChunk: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold font-manrope text-white pt-2 pb-1 border-b border-white/10">
              {formatInline(trimmed.replace('### ', ''))}
            </h3>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base font-extrabold font-manrope text-white pt-3 pb-1 border-b border-white/10">
              {formatInline(trimmed.replace('## ', ''))}
            </h2>
          );
        }

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-lg font-black font-manrope text-white pt-3 pb-1 border-b border-white/15">
              {formatInline(trimmed.replace('# ', ''))}
            </h1>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-2 border-[#ef233c] bg-[#ef233c]/10 pl-3 py-1 my-1 rounded-r text-zinc-300 italic">
              {formatInline(trimmed.replace('> ', ''))}
            </blockquote>
          );
        }

        // Horizontal Rule
        if (trimmed === '---') {
          return <hr key={idx} className="my-3 border-white/10" />;
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-[#ef233c] font-bold leading-relaxed">•</span>
              <span className="flex-1">{formatInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
            </div>
          );
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-[#ef233c] font-bold font-mono text-xs mt-0.5">{numMatch[1]}.</span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        // Normal paragraph
        return <p key={idx}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
};

// Helper for inline styles: **bold**, *italic*, `code`
function formatInline(text: string): React.ReactNode {
  // Split by inline code: `code`
  const codeParts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith('`') && cPart.endsWith('`') && cPart.length > 2) {
          return (
            <code key={cIdx} className="px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-[#ef233c] font-mono text-[11px] font-semibold">
              {cPart.slice(1, -1)}
            </code>
          );
        }

        // Split by bold: **bold**
        const boldParts = cPart.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={cIdx}>
            {boldParts.map((bPart, bIdx) => {
              if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
                return (
                  <strong key={bIdx} className="font-bold text-white">
                    {bPart.slice(2, -2)}
                  </strong>
                );
              }

              // Split by italic: *italic*
              const italicParts = bPart.split(/(\*[^*]+\*)/g);
              return (
                <span key={bIdx}>
                  {italicParts.map((iPart, iIdx) => {
                    if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
                      return <em key={iIdx} className="italic text-zinc-300">{iPart.slice(1, -1)}</em>;
                    }
                    return iPart;
                  })}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
}
