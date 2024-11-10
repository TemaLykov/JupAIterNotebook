import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <ReactMarkdown className="prose prose-invert prose-headings:mt-0 prose-headings:mb-4 prose-p:my-2 max-w-none">
      {content}
    </ReactMarkdown>
  );
}

export default MarkdownPreview;