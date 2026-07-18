import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CustomMarkdownProps {
  content: string;
}

export default function CustomMarkdown({ content }: CustomMarkdownProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Basic custom markdown parser to guarantee React 19 compatibility and pristine look
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let codeLanguage = '';
    let listItems: string[] = [];
    let codeBlockKey = 0;

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key} id={`list-${key}`} className="list-disc pl-5 my-3 space-y-1.5 text-slate-600">
            {listItems.map((item, idx) => (
              <li key={idx} id={`list-item-${key}-${idx}`} className="leading-relaxed">
                {parseInlineText(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const parseInlineText = (lineText: string) => {
      // Bold syntax **text**
      const parts = lineText.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="font-semibold text-slate-900">{part}</strong>;
        }
        // Handle inline code `code`
        const codeParts = part.split(/`(.*?)`/g);
        return codeParts.map((subPart, subIdx) => {
          if (subIdx % 2 === 1) {
            return (
              <code key={subIdx} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-rose-600 font-mono text-[13px] rounded">
                {subPart}
              </code>
            );
          }
          return subPart;
        });
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks ```
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Close block
          inCodeBlock = false;
          const codeText = codeBlockLines.join('\n');
          const currentIndex = codeBlockKey++;
          elements.push(
            <div key={`code-${i}`} id={`code-block-container-${i}`} className="relative my-4 border border-gray-100 rounded-md overflow-hidden group">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 text-gray-400 text-[11px] font-mono border-b border-gray-100">
                <span>{codeLanguage || 'code'}</span>
                <button
                  id={`btn-copy-${currentIndex}`}
                  onClick={() => handleCopy(codeText, currentIndex)}
                  className="flex items-center gap-1 hover:text-black text-gray-400 transition-colors focus:outline-none font-medium"
                  title="Copy code"
                >
                  {copiedIndex === currentIndex ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-gray-50/40 text-gray-800 overflow-x-auto font-mono text-xs leading-relaxed border-l-2 border-black">
                <code>{codeText}</code>
              </pre>
            </div>
          );
          codeBlockLines = [];
          codeLanguage = '';
        } else {
          // Open block
          flushList(`flush-${i}`);
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3);
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      // Headings
      if (line.startsWith('### ')) {
        flushList(`flush-h3-${i}`);
        elements.push(
          <h3 key={`h3-${i}`} id={`heading-3-${i}`} className="text-sm font-bold text-gray-800 mt-5 mb-2 font-display flex items-center gap-2 tracking-tight">
            <span className="w-1 h-3 bg-black rounded-sm"></span>
            {line.slice(4)}
          </h3>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        flushList(`flush-h2-${i}`);
        elements.push(
          <h2 key={`h2-${i}`} id={`heading-2-${i}`} className="text-base font-bold text-gray-800 mt-6 mb-3 font-display border-b border-gray-100 pb-1 tracking-tight">
            {line.slice(3)}
          </h2>
        );
        continue;
      }

      if (line.startsWith('# ')) {
        flushList(`flush-h1-${i}`);
        elements.push(
          <h1 key={`h1-${i}`} id={`heading-1-${i}`} className="text-lg font-extrabold text-gray-900 mt-8 mb-4 font-display tracking-tight">
            {line.slice(2)}
          </h1>
        );
        continue;
      }

      // Lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        listItems.push(line.trim().slice(2));
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        flushList(`flush-empty-${i}`);
        continue;
      }

      // Regular paragraph
      flushList(`flush-para-${i}`);
      elements.push(
        <p key={`p-${i}`} id={`paragraph-${i}`} className="my-2.5 text-slate-600 leading-relaxed text-sm">
          {parseInlineText(line)}
        </p>
      );
    }

    // Flush any leftover list items
    flushList('flush-final');

    return elements;
  };

  return <div className="space-y-1">{parseContent(content)}</div>;
}
