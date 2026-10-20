import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Safe inline text parser for bold, italic, code, links, images, etc.
  const renderInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Image: ![alt](url)
      const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        parts.push(
          <img
            key={key++}
            src={src}
            alt={alt || 'Content image'}
            referrerPolicy="no-referrer"
            className="rounded-lg my-4 max-h-96 w-full object-cover border border-slate-200 dark:border-slate-800"
          />
        );
        remaining = remaining.slice(imgMatch[0].length);
        continue;
      }

      // Link: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const href = linkMatch[2];
        parts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {linkText}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold: **text** or __text__
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        parts.push(
          <strong key={key++} className="font-semibold text-slate-900 dark:text-slate-100">
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch) {
        parts.push(
          <em key={key++} className="italic text-slate-800 dark:text-slate-200">
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Strikethrough: ~~text~~
      const strikeMatch = remaining.match(/^~~(.*?)~~/);
      if (strikeMatch) {
        parts.push(
          <del key={key++} className="line-through text-slate-400 dark:text-slate-500">
            {strikeMatch[1]}
          </del>
        );
        remaining = remaining.slice(strikeMatch[0].length);
        continue;
      }

      // Plain character step
      const nextSpecial = remaining.search(/[`*_\!\[~]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  // Block level parser
  const renderBlocks = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    let key = 0;
    let codeBlockCount = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced Code Block: ```language
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const fullCode = codeLines.join('\n');
        const blockId = codeBlockCount++;
        const isCopied = copiedIndex === blockId;

        elements.push(
          <div key={key++} className="my-4 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900 text-slate-100 text-sm">
            <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span>{lang || 'code'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(fullCode, blockId)}
                className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy code"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Headers: # H1, ## H2, ### H3, #### H4
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            {renderInline(line.slice(2))}
          </h1>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-6 mb-3">
            {renderInline(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-5 mb-2">
            {renderInline(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }
      if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={key++} className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">
            {renderInline(line.slice(5))}
          </h4>
        );
        i++;
        continue;
      }

      // Horizontal rule: --- or ***
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={key++} className="my-6 border-t border-slate-200 dark:border-slate-800" />);
        i++;
        continue;
      }

      // Blockquote: > text
      if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith('>')) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        elements.push(
          <blockquote key={key++} className="pl-4 py-1.5 my-4 border-l-2 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 italic text-slate-700 dark:text-slate-300">
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className="mb-1 last:mb-0">
                {renderInline(ql)}
              </p>
            ))}
          </blockquote>
        );
        continue;
      }

      // Markdown Table: lines starting and ending with |
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerRow = tableLines[0].slice(1, -1).split('|').map(c => c.trim());
          // row 1 is separator |---|---|
          const bodyRows = tableLines.slice(2).map(r => r.slice(1, -1).split('|').map(c => c.trim()));

          elements.push(
            <div key={key++} className="my-5 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 font-medium">
                  <tr>
                    {headerRow.map((h, hIdx) => (
                      <th key={hIdx} className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 font-semibold">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 font-mono text-xs tabular-nums">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Interactive Checklist: - [x] or - [ ]
      if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]') || line.trim().startsWith('- [X]')) {
        const listItems: { checked: boolean; text: string }[] = [];
        while (
          i < lines.length &&
          (lines[i].trim().startsWith('- [ ]') || lines[i].trim().startsWith('- [x]') || lines[i].trim().startsWith('- [X]'))
        ) {
          const trimmed = lines[i].trim();
          const checked = trimmed.startsWith('- [x]') || trimmed.startsWith('- [X]');
          const itemText = trimmed.slice(5).trim();
          listItems.push({ checked, text: itemText });
          i++;
        }
        elements.push(
          <ul key={key++} className="my-3 space-y-1.5">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={item.checked}
                  readOnly
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={item.checked ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                  {renderInline(item.text)}
                </span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Unordered list: - item or * item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().slice(2));
          i++;
        }
        elements.push(
          <ul key={key++} className="my-3 space-y-1 list-disc list-inside text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list: 1. item
      if (line.trim().match(/^\d+\.\s/)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
          i++;
        }
        elements.push(
          <ol key={key++} className="my-3 space-y-1 list-decimal list-inside text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Regular Paragraph
      elements.push(
        <p key={key++} className="mb-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  return <div className={`markdown-prose ${className}`}>{renderBlocks()}</div>;
};
