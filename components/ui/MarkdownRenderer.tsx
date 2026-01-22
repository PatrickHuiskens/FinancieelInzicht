import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split text into lines to handle block elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let listBuffer: React.ReactNode[] = [];
  let inList = false;

  const processInlineFormatting = (text: string) => {
    // Basic bold parser: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Headers
    if (trimmedLine.startsWith('### ')) {
      if (inList) {
        elements.push(<ul key={`list-${index}`} className="list-disc pl-5 mb-4 space-y-1 text-slate-700">{listBuffer}</ul>);
        listBuffer = [];
        inList = false;
      }
      elements.push(<h3 key={index} className="text-sm font-bold text-slate-900 mt-4 mb-2">{processInlineFormatting(trimmedLine.slice(4))}</h3>);
      return;
    }

    // List items (* or -)
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      inList = true;
      listBuffer.push(
        <li key={`li-${index}`} className="pl-1">
          {processInlineFormatting(trimmedLine.slice(2))}
        </li>
      );
      return;
    }

    // Numbered lists (1. )
    if (/^\d+\.\s/.test(trimmedLine)) {
       // Treating numbered lists similarly to bullet points for simplicity in this lightweight renderer
       inList = true;
       listBuffer.push(
        <li key={`li-${index}`} className="pl-1">
           <span className="font-medium mr-1">{trimmedLine.split(' ')[0]}</span>
           {processInlineFormatting(trimmedLine.replace(/^\d+\.\s/, ''))}
        </li>
       );
       return;
    }

    // Flush list if we encounter a normal line
    if (inList && trimmedLine !== '') {
      elements.push(<ul key={`list-${index}`} className="list-disc pl-5 mb-4 space-y-1 text-slate-700">{listBuffer}</ul>);
      listBuffer = [];
      inList = false;
    }

    // Regular paragraphs
    if (trimmedLine !== '') {
      elements.push(<p key={index} className="mb-2 text-slate-700 leading-relaxed">{processInlineFormatting(trimmedLine)}</p>);
    }
  });

  // Flush remaining list
  if (inList) {
    elements.push(<ul key="list-end" className="list-disc pl-5 mb-4 space-y-1 text-slate-700">{listBuffer}</ul>);
  }

  return <div className="text-sm">{elements}</div>;
};

export default MarkdownRenderer;