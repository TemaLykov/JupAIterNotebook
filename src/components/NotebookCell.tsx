import React, { useState, useEffect } from 'react';
import { Play, Trash2, Type, Code, Link, Eye, Edit } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { Cell, CellType, CellStatus, CellOutput } from '../types';
import MarkdownPreview from './MarkdownPreview';

interface NotebookCellProps {
  cell: Cell;
  index: number;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onExecute: () => void;
  onAttach: () => void;
  isAttached: boolean;
  onMoveToNextCell: () => void;
}

function NotebookCell({
  cell,
  index,
  isActive,
  onUpdate,
  onDelete,
  onExecute,
  onAttach,
  isAttached,
  onMoveToNextCell,
}: NotebookCellProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (cell.type === 'code') {
        onExecute();
      } else {
        setIsEditing(!isEditing);
      }
      onMoveToNextCell();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const renderOutput = (output: CellOutput) => {
    switch (output.output_type) {
      case 'stream':
        return (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm">
            {output.text?.join('\n')}
          </pre>
        );

      case 'execute_result':
      case 'display_data':
        if (output.data?.['text/html']) {
          return (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: output.data['text/html'].join('\n') 
              }} 
            />
          );
        } else if (output.data?.['image/png']) {
          return (
            <img 
              src={`data:image/png;base64,${output.data['image/png']}`}
              alt="Output"
              className="max-w-full"
            />
          );
        } else if (output.data?.['text/plain']) {
          return (
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
              {output.data['text/plain'].join('\n')}
            </pre>
          );
        }
        break;

      case 'error':
        return (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-red-400">
            {output.traceback?.join('\n')}
          </pre>
        );
    }
  };

  const getStatusColor = (status: CellStatus) => {
    switch (status) {
      case 'running': return 'border-yellow-500';
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      default: return 'border-transparent';
    }
  };

  const getCellBackground = (type: CellType) => {
    return type === 'code' ? 'bg-gray-900/50' : 'bg-gray-800/30';
  };

  return (
    <div className={`group relative border-l-2 ${getStatusColor(cell.status)} ${getCellBackground(cell.type)} rounded-lg transition-colors duration-200`}>
      <div className="absolute left-0 top-0 bottom-0 w-[50px] flex items-center justify-center text-gray-500 font-mono text-sm cursor-pointer hover:bg-gray-800/50 rounded-l-lg transition-colors"
           onClick={onAttach}>
        <div className="flex items-center gap-1">
          {isAttached && <Link className="w-3 h-3" />}
          {cell.type === 'code' ? (
            cell.status === 'running' ? '[*]' :
            cell.status === 'success' ? `[${index + 1}]` :
            cell.status === 'error' ? '[!]' : `[${index + 1}]`
          ) : `[${index + 1}]`}
        </div>
      </div>

      <div className="ml-[50px] p-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <div className="flex items-center gap-1">
            {cell.type === 'code' ? (
              <Code className="w-4 h-4" />
            ) : (
              <Type className="w-4 h-4" />
            )}
            {cell.type === 'code' ? 'Python' : 'Markdown'}
          </div>
          <div className="flex-1" />
          {cell.type === 'markdown' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title={isEditing ? 'Preview (Shift+Enter)' : 'Edit (Shift+Enter)'}
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </button>
          )}
          {cell.type === 'code' && (
            <button
              onClick={() => {
                onExecute();
                onMoveToNextCell();
              }}
              disabled={cell.status === 'running'}
              className="p-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Run cell (Shift+Enter)"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title="Delete cell"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="transition-all duration-200 ease-in-out">
          {cell.type === 'markdown' && !isEditing ? (
            <div
              onClick={() => setIsEditing(true)}
              className="cursor-text px-4 py-2 rounded bg-gray-800/50 prose prose-invert max-w-none"
            >
              <MarkdownPreview content={cell.content || '*Empty markdown cell*'} />
            </div>
          ) : (
            <div className="min-h-[2.5rem]">
              <CodeMirror
                value={cell.content}
                onChange={onUpdate}
                theme={oneDark}
                extensions={[cell.type === 'code' ? python() : markdown()]}
                basicSetup={{
                  lineNumbers: false,
                  foldGutter: false,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  syntaxHighlighting: true,
                }}
                height="auto"
                minHeight="2.5rem"
                placeholder={
                  cell.type === 'code'
                    ? '# Enter your Python code here'
                    : '# Enter markdown here'
                }
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
        </div>

        {cell.outputs.length > 0 && (
          <div className="mt-4 space-y-2 pl-4 border-l-2 border-gray-700">
            {cell.outputs.map((output, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 ${
                  output.output_type === 'error'
                    ? 'bg-red-900/30'
                    : 'bg-gray-800/80'
                }`}
              >
                {renderOutput(output)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotebookCell;