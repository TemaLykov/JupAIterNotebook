import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';

interface NotebookVersionsProps {
  versions: { [key: string]: any };
  onRestore: (version: any) => void;
}

function NotebookVersions({ versions, onRestore }: NotebookVersionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (Object.keys(versions).length === 0) return null;

  return (
    <div className="border-t border-gray-700 bg-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between text-gray-300 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" />
          <span>Notebook Versions ({Object.keys(versions).length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-2">
          {Object.entries(versions).map(([name, notebook]) => (
            <div
              key={name}
              className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
            >
              <span className="text-gray-300">{name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onRestore(notebook)}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotebookVersions;